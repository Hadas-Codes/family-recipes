import express from 'express';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// שליפת כל המתכונים (או לפי קטגוריה) ממונגו
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (err) {
    console.error('שגיאה בשליפת מתכונים:', err);
    res.status(500).json({ error: 'שגיאה בשליפת מתכונים' });
  }
});

// הוספת מתכון חדש ישירות למונגו
router.post('/', async (req, res) => {
  try {
    const { title, category, description, ingredients, instructions, image } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'חובה לציין כותרת וקטגוריה' });
    }

    const newRecipe = await Recipe.create({
      title,
      category,
      description,
      ingredients,
      instructions,
      image
    });

    res.status(201).json(newRecipe);
  } catch (err) {
    console.error('שגיאה בשמירת מתכון:', err);
    res.status(500).json({ error: 'שגיאה בשמירת מתכון' });
  }
});

// עדכון מתכון קיים
router.put('/:id', async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'מתכון לא נמצא' });
    }
    res.json(updated);
  } catch (err) {
    console.error('שגיאה בעדכון מתכון:', err);
    res.status(500).json({ error: 'שגיאה פנימית בשרת' });
  }
});

// מחיקת מתכון
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'מתכון לא נמצא' });
    }
    res.json({ message: 'המתכון נמחק בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקת מתכון:', err);
    res.status(500).json({ error: 'שגיאה פנימית בשרת' });
  }
});

export default router;