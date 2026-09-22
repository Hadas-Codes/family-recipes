async function loadRecipes() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  let fetchUrl = '/api/recipes';
  const categoryNames = {
    cakes: 'עוגות נבחרות',
    cookies: 'עוגיות נבחרות',
    pastries: 'מאפים נבחרים',
    food: 'אוכל ביתי',
    desserts: 'קינוחים נבחרים'
  };

  if (category && categoryNames[category]) {
    fetchUrl += `?category=${category}`;
    document.getElementById('section-title').innerText = categoryNames[category];
  } else {
    document.getElementById('section-title').innerText = 'כל המתכונים הנפלאים';
  }

  try {
    const res = await fetch(fetchUrl);
    const data = await res.json();
    const recipes = Array.isArray(data) ? data : (data.recipes || data.data || []);
    
    const container = document.getElementById('recipes-container');
    container.innerHTML = '';

    if (recipes.length === 0) {
      container.innerHTML = '<p>אין מתכונים להצגה בקטגוריה זו.</p>';
      return;
    }

    recipes.forEach((r, index) => {
      // זיהוי מזהה מתכון (תמיכה ב-id, _id או אינדקס גיבוי)
      const recipeId = r.id || r._id || index;
      
      const card = document.createElement('div');
      card.className = 'recipe-card';

      const rawIngredients = Array.isArray(r.ingredients) 
        ? r.ingredients.join(', ') 
        : (r.ingredients || '');

      const formattedIngredients = rawIngredients
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .join('<br>');

      const rawInstructions = Array.isArray(r.instructions) 
        ? r.instructions.join('\n') 
        : (r.instructions || '');

      const formattedInstructions = rawInstructions
        .replace(/\n/g, '<br>');

      card.innerHTML = `
        <div>
          ${r.image ? `<img src="${r.image}" alt="${r.title}" onerror="this.style.display='none'">` : ''}
          <h3>${r.title}</h3>
          <p class="recipe-desc">${r.description || ''}</p>
          <div class="recipe-info" style="text-align: right; margin-top: 10px; font-size: 0.95rem; border-top: 1px solid #eee; padding-top: 10px; line-height: 1.6;">
            <p><strong>מצרכים:</strong><br>${formattedIngredients}</p>
            <p style="margin-top: 10px;"><strong>אופן הכנה:</strong><br>${formattedInstructions}</p>
          </div>
        </div>
        <div class="recipe-actions">
          <button onclick="editRecipe('${recipeId}')" style="background: rgba(0, 0, 0, 0.06); color: #333; border: 1px solid rgba(0, 0, 0, 0.12); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.78rem;">עדכון</button>
          <button onclick="deleteRecipe('${recipeId}')" style="background: rgba(230, 57, 70, 0.14); color: #d62828; border: 1px solid rgba(230, 57, 70, 0.3); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.78rem;">מחיקה</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('שגיאה בטעינת מתכונים:', error);
  }
}

// פונקציית מחיקה
async function deleteRecipe(id) {
  if (!confirm('האם את בטוחה שברצונך למחוק מתכון זה?')) return;
  try {
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('המתכון נמחק בהצלחה');
      loadRecipes();
    } else {
      alert('שגיאה במחיקת המתכון (ודאי שיש נתיב DELETE בשרת)');
    }
  } catch (err) {
    console.error(err);
    alert('שגיאה בחיבור לשרת');
  }
}

// פונקציית עדכון (מעבירה לדף הוספה/עריכה עם מזהה)
function editRecipe(id) {
  window.location.href = `add-recipe.html?edit=${id}`;
}

document.addEventListener('DOMContentLoaded', loadRecipes);

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('recipe-search');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const recipeCards = document.querySelectorAll('.recipe-card');

      recipeCards.forEach(card => {
        const titleElement = card.querySelector('h3');
        const titleText = titleElement ? titleElement.innerText.toLowerCase() : '';
        
        // אם תיבת החיפוש ריקה או שהשם תואם - מציגים, אחרת מסתירים
        if (query === '' || titleText.includes(query)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  }
});