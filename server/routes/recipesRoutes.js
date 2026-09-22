import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/recipes.json');

const router = express.Router();

function getRecipesData() {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

router.get('/', (req, res) => {
  const { category } = req.query;
  const data = getRecipesData();
  if (category) {
    const filtered = data.filter(r => r.category === category);
    return res.json(filtered);
  }
  res.json(data);
});

router.post('/', (req, res) => {
  const { title, category, description, ingredients, instructions, image } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'חובה לציין כותרת וקטגוריה' });
  }

  const data = getRecipesData();
  const newRecipe = {
    id: Date.now().toString(),
    title,
    category,
    description: description || '',
    ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map(i => i.trim()) : []),
    instructions: instructions || '',
    image: image || 'https://via.placeholder.com/300x200?text=Recipe'
  };

  data.push(newRecipe);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  res.status(201).json(newRecipe);
});

// עדכון מתכון קיים (PUT)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, description, ingredients, instructions, image } = req.body;
    
    let data = getRecipesData();
    const index = data.findIndex(r => String(r.id) === String(id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'מתכון לא נמצא' });
    }
    
    data[index] = {
      ...data[index],
      title: title || data[index].title,
      category: category || data[index].category,
      description: description !== undefined ? description : data[index].description,
      ingredients: ingredients !== undefined 
        ? (Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim())) 
        : data[index].ingredients,
      instructions: instructions !== undefined ? instructions : data[index].instructions,
      image: (image !== undefined && image !== '') ? image : data[index].image
    };
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    res.json(data[index]);
  } catch (error) {
    console.error('שגיאה בעדכון מתכון:', error);
    res.status(500).json({ error: 'שגיאה פנימית בשרת' });
  }
});

// מחיקת מתכון (DELETE)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = getRecipesData();
    const filtered = data.filter(r => String(r.id) !== String(id));

    if (filtered.length === data.length) {
      return res.status(404).json({ error: 'מתכון לא נמצא' });
    }

    fs.writeFileSync(dataPath, JSON.stringify(filtered, null, 2), 'utf8');
    res.json({ message: 'המתכון נמחק בהצלחה' });
  } catch (error) {
    console.error('שגיאה במחיקת מתכון:', error);
    res.status(500).json({ error: 'שגיאה פנימית בשרת' });
  }
});

export default router;