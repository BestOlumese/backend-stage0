import { fetchGenderPrediction } from '../services/genderize.service.js';

export const classifyName = async (req, res) => {
  try {
    const { name } = req.query;

    // 1. Validation: Missing or empty name
    if (!name || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or empty name parameter'
      });
    }

    // 2. Validation: Name is not a string
    if (typeof name !== 'string') {
      return res.status(422).json({
        status: 'error',
        message: 'name must be a string'
      });
    }

    // 3. Call Service Layer
    const data = await fetchGenderPrediction(name);

    // 4. Edge Case Handling
    if (data.gender === null || data.count === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No prediction available for the provided name'
      });
    }

    // 5. Logic Processing
    const sample_size = data.count;
    const probability = data.probability;
    const is_confident = probability >= 0.7 && sample_size >= 100;
    const processed_at = new Date().toISOString();

    // 6. Success Response
    return res.status(200).json({
      status: 'success',
      data: {
        name: data.name,
        gender: data.gender,
        probability,
        sample_size,
        is_confident,
        processed_at
      }
    });

  } catch (error) {
    console.error('API Error:', error.message);
    
    // 7. Upstream failure
    if (error.response) {
      return res.status(502).json({
        status: 'error',
        message: 'Upstream API failure'
      });
    }

    // Internal server error
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};