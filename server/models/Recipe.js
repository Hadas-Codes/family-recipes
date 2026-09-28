import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  ingredients: { type: [String], default: [] },
  instructions: { type: String, default: '' },
  image: { type: String, default: 'https://via.placeholder.com/300x200?text=Recipe' }
});

export default mongoose.model('Recipe', recipeSchema);