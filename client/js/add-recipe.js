document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  const form = document.getElementById('add-recipe-form'); // תוקן ל-ID הנכון מה-HTML
  const pageTitle = document.getElementById('page-title') || document.querySelector('h1');
  let currentBase64Image = '';

  // אם זה מצב עריכה - נביא את הנתונים ונמלא את הטופס
  if (editId) {
    if (pageTitle) pageTitle.innerText = 'עריכת מתכון';
    try {
      const res = await fetch(`/api/recipes`);
      const allRecipes = await res.json();
      const recipeToEdit = allRecipes.find(r => String(r.id) === String(editId));

      if (recipeToEdit) {
        document.getElementById('title').value = recipeToEdit.title || '';
        document.getElementById('category').value = recipeToEdit.category || '';
        document.getElementById('description').value = recipeToEdit.description || '';
        
        // המרת מצרכים ממערך למחרוזת עם פסיקים בשביל שדה הטקסט בטופס
        const ingStr = Array.isArray(recipeToEdit.ingredients) 
          ? recipeToEdit.ingredients.join(', ') 
          : (recipeToEdit.ingredients || '');
        document.getElementById('ingredients').value = ingStr;

        document.getElementById('instructions').value = recipeToEdit.instructions || '';
        currentBase64Image = recipeToEdit.image || '';

        // הצגת תצוגה מקדימה לתמונה הקיימת אם יש
        const preview = document.getElementById('image-preview');
        if (preview && currentBase64Image) {
          preview.src = currentBase64Image;
          preview.style.display = 'block';
        }
      }
    } catch (err) {
      console.error('שגיאה בטעינת מתכון לעריכה:', err);
    }
  }

  // טיפול בהמרת קובץ תמונה ל-Base64 בעת בחירה חדשה
  const imageInput = document.getElementById('image');
  if (imageInput) {
    imageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
          currentBase64Image = reader.result;
          const preview = document.getElementById('image-preview');
          if (preview) {
            preview.src = currentBase64Image;
            preview.style.display = 'block';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // טיפול בשליחת הטופס (הוספה או עדכון)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const recipeData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        ingredients: document.getElementById('ingredients').value,
        instructions: document.getElementById('instructions').value,
        image: currentBase64Image
      };

      const method = editId ? 'PUT' : 'POST';
      const endpoint = editId ? `/api/recipes/${editId}` : '/api/recipes';

      try {
        const res = await fetch(endpoint, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipeData)
        });

        if (res.ok) {
          alert(editId ? 'המתכון עודכן בהצלחה!' : 'המתכון נוסף בהצלחה!');
          window.location.href = 'recipes.html';
        } else {
          alert('שגיאה בשמירת המתכון');
        }
      } catch (err) {
        console.error('שגיאה בשליחה:', err);
        alert('שגיאה בחיבור לשרת');
      }
    });
  }
});