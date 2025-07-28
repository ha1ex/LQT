# Система UI компонентов

## Обзор

Система UI компонентов построена на базе shadcn/ui и Radix UI, обеспечивая консистентный, доступный и кастомизируемый интерфейс.

## Архитектура UI системы

### 1. Базовые компоненты (src/components/ui/)

#### Основные примитивы
- **Button** (`button.tsx`) - Универсальная кнопка с вариантами
- **Input** (`input.tsx`) - Поля ввода
- **Card** (`card.tsx`) - Контейнеры для контента
- **Dialog** (`dialog.tsx`) - Модальные окна
- **Sheet** (`sheet.tsx`) - Боковые панели

#### Навигация
- **BottomNavigation** (`bottom-navigation.tsx`) - Мобильная навигация
- **MobileHeader** (`mobile-header.tsx`) - Шапка для мобильных
- **Breadcrumb** (`breadcrumb.tsx`) - Хлебные крошки
- **NavigationMenu** (`navigation-menu.tsx`) - Основное меню

#### Формы и ввод
- **Form** (`form.tsx`) - Обертка для форм с валидацией
- **Label** (`label.tsx`) - Подписи к полям
- **Checkbox** (`checkbox.tsx`) - Чекбоксы
- **RadioGroup** (`radio-group.tsx`) - Радио кнопки
- **Select** (`select.tsx`) - Выпадающие списки
- **Slider** (`slider.tsx`) - Ползунки
- **Switch** (`switch.tsx`) - Переключатели
- **Textarea** (`textarea.tsx`) - Многострочный ввод

#### Отображение данных
- **Table** (`table.tsx`) - Таблицы
- **Chart** (`chart.tsx`) - Графики и диаграммы
- **Progress** (`progress.tsx`) - Индикаторы прогресса
- **Badge** (`badge.tsx`) - Бейджи и теги
- **Avatar** (`avatar.tsx`) - Аватары пользователей

#### Обратная связь
- **Toast** (`toast.tsx`, `toaster.tsx`) - Уведомления
- **AlertDialog** (`alert-dialog.tsx`) - Диалоги подтверждения
- **Alert** (`alert.tsx`) - Предупреждения
- **Skeleton** (`skeleton.tsx`) - Загрузочные состояния

#### Утилитарные
- **Tooltip** (`tooltip.tsx`) - Подсказки
- **Popover** (`popover.tsx`) - Всплывающие панели
- **Separator** (`separator.tsx`) - Разделители
- **ScrollArea** (`scroll-area.tsx`) - Прокручиваемые области

### 2. Специализированные компоненты

#### EmptyStateView (`empty-state-view.tsx`)
**Назначение**: Отображение пустых состояний для новых пользователей

**Особенности**:
- Адаптивный дизайн
- Call-to-action кнопки
- Иллюстрации и иконки
- Информативные сообщения

**Использование**:
```tsx
<EmptyStateView 
  title="Добро пожаловать!"
  description="Начните отслеживать качество жизни"
  actionLabel="Начать"
  onAction={() => generateDemoData()}
/>
```

#### DemoModeToggle (`demo-mode-toggle.tsx`)
**Назначение**: Переключение между демо-режимом и реальными данными

**Особенности**:
- Визуальная индикация режима
- Подтверждение при переключении
- Интеграция с GlobalDataProvider

**Использование**:
```tsx
<DemoModeToggle />
```

## Система дизайна

### 1. Цветовая схема (index.css)

#### Основные цвета
```css
:root {
  --background: 0 0% 100%;        /* Белый фон */
  --foreground: 0 0% 3.9%;        /* Основной текст */
  --primary: 197 100% 50%;        /* Основной цвет */
  --primary-foreground: 0 0% 98%; /* Текст на основном */
  --secondary: 210 40% 98%;       /* Вторичный цвет */
  --muted: 210 40% 96%;          /* Приглушенный */
  --accent: 210 40% 96%;         /* Акцентный */
  --destructive: 0 84% 60%;      /* Деструктивный */
  --border: 214 32% 91%;         /* Границы */
  --input: 214 32% 91%;          /* Поля ввода */
  --ring: 197 100% 50%;          /* Фокус */
}
```

#### Темная тема
```css
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... остальные цвета для темной темы */
}
```

### 2. Типографика

#### Размеры текста
- `text-xs` - 12px - Мелкий текст
- `text-sm` - 14px - Обычный текст
- `text-base` - 16px - Базовый размер
- `text-lg` - 18px - Крупный текст
- `text-xl` до `text-6xl` - Заголовки

#### Веса шрифта
- `font-normal` - 400 - Обычный
- `font-medium` - 500 - Средний
- `font-semibold` - 600 - Полужирный
- `font-bold` - 700 - Жирный

### 3. Отступы и размеры

#### Система отступов (4px base)
- `p-1` - 4px
- `p-2` - 8px
- `p-4` - 16px
- `p-6` - 24px
- `p-8` - 32px

#### Размеры компонентов
- `h-8` - 32px - Мелкие элементы
- `h-10` - 40px - Средние элементы
- `h-12` - 48px - Крупные элементы

## Варианты компонентов

### Button варианты
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### Card варианты
```tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
```

## Адаптивность

### Breakpoints
```css
sm: '640px'   /* Планшеты */
md: '768px'   /* Средние планшеты */
lg: '1024px'  /* Маленькие десктопы */
xl: '1280px'  /* Большие десктопы */
2xl: '1536px' /* Очень большие экраны */
```

### Мобильная адаптация
- **BottomNavigation** - Навигация снизу на мобильных
- **MobileHeader** - Компактная шапка
- **ResponsiveDialog** - Drawer на мобильных, Dialog на десктопе
- **TouchOptimized** - Увеличенные области нажатия

### Стратегии адаптивности
```tsx
// Скрытие на мобильных
<div className="hidden md:block">Desktop only</div>

// Показ только на мобильных  
<div className="block md:hidden">Mobile only</div>

// Адаптивные размеры
<div className="text-sm md:text-base lg:text-lg">Responsive text</div>
```

## Доступность (a11y)

### Клавиатурная навигация
- Tab order для всех интерактивных элементов
- Enter/Space для активации
- Escape для закрытия модалок
- Arrow keys для списков и меню

### Screen reader поддержка
- ARIA labels для всех элементов
- Live regions для динамических обновлений
- Semantic HTML структура
- Описательные alt тексты

### Контрастность
- WCAG AA соответствие
- Высокий контраст для текста
- Визуальные индикаторы фокуса

## Анимации и переходы

### Принципы анимации
- **Subtle** - Ненавязчивые переходы
- **Fast** - Быстрые (150-300ms)
- **Purposeful** - Анимации с целью

### Типы анимаций
```css
/* Fade переходы */
.animate-in { animation: fadeIn 0.2s ease-out; }
.animate-out { animation: fadeOut 0.2s ease-in; }

/* Slide переходы */
.slide-in-from-top { animation: slideInTop 0.3s ease-out; }
.slide-in-from-bottom { animation: slideInBottom 0.3s ease-out; }

/* Пружинные анимации */
.animate-bounce { animation: bounce 1s infinite; }
```

## Интеграция с данными

### Состояния загрузки
```tsx
// Skeleton для загрузки
{isLoading ? (
  <Skeleton className="h-4 w-full" />
) : (
  <div>{data}</div>
)}
```

### Обработка ошибок
```tsx
// Alert для ошибок
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Ошибка</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

### Пустые состояния
```tsx
// EmptyStateView для пустых данных
{data.length === 0 && (
  <EmptyStateView
    title="Нет данных"
    description="Начните добавлять записи"
    actionLabel="Добавить"
    onAction={handleAdd}
  />
)}
```

## Кастомизация

### Создание новых вариантов
```tsx
// Расширение существующих компонентов
const CustomButton = ({ variant = "primary", ...props }) => (
  <Button 
    className={cn(
      variant === "primary" && "bg-gradient-to-r from-blue-500 to-purple-600"
    )}
    {...props}
  />
)
```

### Темизация
```css
/* Кастомные CSS переменные */
:root {
  --custom-gradient: linear-gradient(135deg, var(--primary), var(--secondary));
  --custom-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}
```

## Лучшие практики

### 1. Консистентность
- Используйте готовые компоненты
- Придерживайтесь дизайн-системы
- Не создавайте одноразовые стили

### 2. Производительность
- Ленивая загрузка тяжелых компонентов
- Мемоизация вычислений
- Виртуализация длинных списков

### 3. Поддерживаемость
- Документируйте кастомные компоненты
- Используйте TypeScript типы
- Тестируйте критичные компоненты

### 4. Пользовательский опыт
- Быстрые отклики на действия
- Информативные состояния загрузки
- Понятные сообщения об ошибках