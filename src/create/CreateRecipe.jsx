// components/CreateRecipe.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './CreateRecipe.css';

export default function CreateRecipe() {
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    cooking_time: '',
    calories: '',
    weight: '',
    servings: '',
    images: []
  });

  const navigate = useNavigate();

  // Обработчик изменения текстовых полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Добавление ингредиента
  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  // Изменение ингредиента
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  // Удаление ингредиента
  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }));
    }
  };

  // Добавление шага
  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  // Изменение шага
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  // Удаление шага
  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };

  // Загрузка изображений
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + formData.images.length > 3) {
      alert('Можно загрузить не более 3 изображений');
      return;
    }

    // Предпросмотр изображений
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);

    // Сохраняем файлы
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  // Удаление изображения
  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  // Загрузка изображений в Supabase Storage
  const uploadImages = async (recipeId) => {
    const imageUrls = [];

    for (let i = 0; i < formData.images.length; i++) {
      const file = formData.images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${recipeId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      // Получаем публичный URL
      const { data } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      imageUrls.push(data.publicUrl);
    }

    return imageUrls;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Валидация обязательных полей
      if (!formData.title.trim()) {
        throw new Error('Название рецепта обязательно');
      }

      const validIngredients = formData.ingredients.filter(ing => ing.trim() !== '');
      if (validIngredients.length === 0) {
        throw new Error('Добавьте хотя бы один ингредиент');
      }

      const validSteps = formData.steps.filter(step => step.trim() !== '');
      if (validSteps.length === 0) {
        throw new Error('Добавьте хотя бы один шаг приготовления');
      }

      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      // Создаем рецепт в базе данных
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          ingredients: validIngredients,
          steps: validSteps,
          cooking_time: formData.cooking_time || null,
          calories: formData.calories ? parseInt(formData.calories) : null,
          weight: formData.weight ? parseInt(formData.weight) : null,
          servings: formData.servings ? parseInt(formData.servings) : null,
          image_url: null // будет обновлено после загрузки изображений
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Загружаем изображения, если они есть
      let imageUrls = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(recipe.id);
        
        // Обновляем рецепт с URL изображений
        if (imageUrls.length > 0) {
          await supabase
            .from('recipes')
            .update({ image_url: imageUrls })
            .eq('id', recipe.id);
        }
      }

      alert('Рецепт успешно создан!');
      navigate('/recipes'); // Переход к списку рецептов

    } catch (error) {
      console.error('Error creating recipe:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-recipe-container">
      <div className="create-recipe-header">
        <h1>Создать новый рецепт</h1>
      
        <button 
          onClick={() => navigate('/recipes')}
          className="back-button"
        >
          ← Назад
        </button>
      </div>

      <form onSubmit={handleSubmit} className="recipe-form">
        
        {/* Основная информация */}
        <div className="form-section">
          <h2>Основная информация</h2>
          
          <div className="form-group">
            <label htmlFor="title">Название рецепта *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Например: Паста Карбонара"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание рецепта</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Краткое описание вашего рецепта..."
              rows="3"
            />
          </div>
        </div>

        {/* Изображения */}
        <div className="form-section">
          <h2>Фотографии (до 3 штук)</h2>
          <div className="image-upload-section">
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {imagePreviews.length < 3 && (
                <label className="image-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <span>+</span>
                    <p>Добавить фото</p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Ингредиенты */}
        <div className="form-section">
          <h2>Ингредиенты *</h2>
          <div className="ingredients-list">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-item">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  placeholder="Например: 200г спагетти"
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addIngredient}
            className="add-btn"
          >
            + Добавить ингредиент
          </button>
        </div>

        {/* Шаги приготовления */}
        <div className="form-section">
          <h2>Шаги приготовления *</h2>
          <div className="steps-list">
            {formData.steps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{index + 1}</div>
                <textarea
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder="Опишите шаг приготовления..."
                  rows="2"
                />
                {formData.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStep}
            className="add-btn"
          >
            + Добавить шаг
          </button>
        </div>

        {/* Дополнительная информация */}
        <div className="form-section">
          <h2>Дополнительная информация</h2>
          <div className="additional-info-grid">
            <div className="form-group">
              <label htmlFor="cooking_time">Время приготовления</label>
              <input
                type="text"
                id="cooking_time"
                name="cooking_time"
                value={formData.cooking_time}
                onChange={handleInputChange}
                placeholder="Например: 30 минут"
              />
            </div>

            <div className="form-group">
              <label htmlFor="calories">Ккал на 100г</label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                placeholder="250"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Вес готового блюда (г)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="500"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="servings">Количество порций</label>
              <input
                type="number"
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                placeholder="4"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Кнопка отправки */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Создание...' : 'Создать рецепт'}
          </button>
        </div>
      </form>
    </div>
  );
}