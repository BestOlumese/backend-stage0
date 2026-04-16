import { v7 as uuidv7 } from 'uuid';
import { getDb } from '../db/database.js';
import { fetchGenderPrediction } from '../services/genderize.service.js';
import { fetchAgePrediction } from '../services/agify.service.js';
import { fetchNationalityPrediction } from '../services/nationalize.service.js';
import { getAgeGroup, getHighestProbabilityCountry } from '../utils/classification.js';

export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate incoming name payload
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or empty name parameter'
      });
    }

    const normalizedName = name.trim().toLowerCase();

    const db = await getDb();

    // Check for an existing profile to handle idempotency
    const existing = await db.get(`SELECT * FROM profiles WHERE lower(name) = ?`, [normalizedName]);
    if (existing) {
      return res.status(200).json({
        status: 'success',
        message: 'Profile already exists',
        data: {
          id: existing.id,
          name: existing.name,
          gender: existing.gender,
          gender_probability: existing.gender_probability,
          sample_size: existing.sample_size,
          age: existing.age,
          age_group: existing.age_group,
          country_id: existing.country_id,
          country_probability: existing.country_probability,
          created_at: existing.created_at
        }
      });
    }

    // Fetch all external predictions in parallel to optimize latency
    const [genderData, ageData, nationalityData] = await Promise.all([
      fetchGenderPrediction(normalizedName),
      fetchAgePrediction(normalizedName),
      fetchNationalityPrediction(normalizedName)
    ]);

    // Map external responses to our internal schema
    const ageGroup = getAgeGroup(ageData.age);
    const countryObj = getHighestProbabilityCountry(nationalityData.country);
    
    // Ensure we got a valid country fallback
    if (!countryObj) {
      throw { isExternalApiError: true, message: 'Nationalize returned an invalid response' };
    }

    const newProfile = {
      id: uuidv7(),
      name: normalizedName,
      gender: genderData.gender,
      gender_probability: genderData.probability,
      sample_size: genderData.count,
      age: ageData.age,
      age_group: ageGroup,
      country_id: countryObj.country_id,
      country_probability: countryObj.probability,
      created_at: new Date().toISOString()
    };

    // Persist new profile to the database
    await db.run(`
      INSERT INTO profiles (
        id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newProfile.id,
      newProfile.name,
      newProfile.gender,
      newProfile.gender_probability,
      newProfile.sample_size,
      newProfile.age,
      newProfile.age_group,
      newProfile.country_id,
      newProfile.country_probability,
      newProfile.created_at
    ]);

    // Respond with the newly created profile
    return res.status(201).json({
      status: 'success',
      data: newProfile
    });

  } catch (error) {
    console.error('API Error:', error.message);
    
    // Handle explicit API validation failures (e.g., gender: null)
    if (error.isExternalApiError) {
      return res.status(502).json({
        status: 'error',
        message: error.message
      });
    }

    // Catch generic network timeouts or axios issues gracefully
    if (error.response || error.request) {
      return res.status(502).json({
        status: 'error',
        message: 'External API returned an invalid response or timed out'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

export const getSingleProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const profile = await db.get(`SELECT * FROM profiles WHERE id = ?`, [id]);

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;
    const db = await getDb();

    let query = `SELECT * FROM profiles WHERE 1=1`;
    const params = [];

    if (gender) {
      query += ` AND lower(gender) = ?`;
      params.push(gender.toLowerCase());
    }
    
    if (country_id) {
      query += ` AND lower(country_id) = ?`;
      params.push(country_id.toLowerCase());
    }

    if (age_group) {
      query += ` AND lower(age_group) = ?`;
      params.push(age_group.toLowerCase());
    }

    const profiles = await db.all(query, params);

    // Strip out extra meta-data properties to match the endpoint's clean contract requirements
    const transformedProfiles = profiles.map(p => ({
      id: p.id,
      name: p.name,
      gender: p.gender,
      age: p.age,
      age_group: p.age_group,
      country_id: p.country_id
    }));

    return res.status(200).json({
      status: 'success',
      count: transformedProfiles.length,
      data: transformedProfiles
    });
  } catch (error) {
    console.error('Get All Profiles Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    // Proceed with a hard delete. Returning 204 regardless of prior existence works well for idempotent deletes.
    await db.run(`DELETE FROM profiles WHERE id = ?`, [id]);

    return res.status(204).send();
  } catch (error) {
    console.error('Delete Profile Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
