import { useState, useEffect, useCallback } from 'react';
import { Subject, SubjectType } from '@/types/strategy';
import { generateId } from '@/utils/strategy';

const STORAGE_KEY = 'lqt_subjects';

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'self',
    name: 'Я сам',
    type: SubjectType.SELF,
    description: 'Моё собственное поведение и привычки',
    influenceLevel: 'high',
    relationshipType: 'personal',
    motivationFactors: ['личная выгода', 'самосовершенствование', 'достижение целей'],
    resistanceFactors: ['лень', 'старые привычки', 'недостаток мотивации']
  },
  {
    id: 'partner',
    name: 'Партнер/Супруг',
    type: SubjectType.FAMILY,
    description: 'Поведение близкого партнера',
    influenceLevel: 'high',
    relationshipType: 'intimate',
    motivationFactors: ['забота о семье', 'взаимная поддержка', 'общие цели'],
    resistanceFactors: ['разные приоритеты', 'недопонимание', 'занятость']
  },
  {
    id: 'children',
    name: 'Дети',
    type: SubjectType.FAMILY,
    description: 'Поведение детей в семье',
    influenceLevel: 'medium',
    relationshipType: 'parental',
    motivationFactors: ['пример родителей', 'поощрения', 'интерес'],
    resistanceFactors: ['возрастные особенности', 'внешние влияния', 'настроение']
  },
  {
    id: 'colleagues',
    name: 'Коллеги',
    type: SubjectType.COLLEAGUES,
    description: 'Рабочая команда и коллеги',
    influenceLevel: 'medium',
    relationshipType: 'professional',
    motivationFactors: ['карьерный рост', 'признание', 'команда'],
    resistanceFactors: ['корпоративная культура', 'конкуренция', 'стресс']
  },
  {
    id: 'friends',
    name: 'Друзья',
    type: SubjectType.FRIENDS,
    description: 'Круг близких друзей',
    influenceLevel: 'medium',
    relationshipType: 'friendship',
    motivationFactors: ['социальная поддержка', 'общие интересы', 'веселье'],
    resistanceFactors: ['разные взгляды', 'расстояние', 'занятость']
  }
];

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load subjects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const isDemoMode = localStorage.getItem('lqt_demo_mode') === 'true';
      
      console.log('🔍 useSubjects loading:', { 
        storedExists: !!stored, 
        isDemoMode, 
        storedData: stored ? JSON.parse(stored) : null 
      });
      
      if (stored && stored !== 'null' && stored !== '[]') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('✅ Loaded subjects from storage:', parsed.length);
          setSubjects(parsed);
        } else {
          console.log('⚠️ Empty subjects in storage, using defaults');
          setSubjects(DEFAULT_SUBJECTS);
        }
      } else {
        console.log('📝 No subjects found, using defaults');
        setSubjects(DEFAULT_SUBJECTS);
        // Save defaults to localStorage for consistency
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUBJECTS));
      }
    } catch (error) {
      console.error('❌ Error loading subjects:', error);
      setSubjects(DEFAULT_SUBJECTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUBJECTS));
    } finally {
      setLoading(false);
    }
  }, []);

  // Save subjects to localStorage
  const saveToStorage = useCallback((subjectsData: Subject[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjectsData));
    } catch (error) {
      console.error('Error saving subjects:', error);
    }
  }, []);

  // Create new custom subject
  const createSubject = useCallback((subjectData: Omit<Subject, 'id'>): string => {
    const newSubject: Subject = {
      ...subjectData,
      id: generateId(),
      type: SubjectType.CUSTOM
    };

    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    saveToStorage(updatedSubjects);
    
    return newSubject.id;
  }, [subjects, saveToStorage]);

  // Update existing subject
  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    const updatedSubjects = subjects.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    
    setSubjects(updatedSubjects);
    saveToStorage(updatedSubjects);
  }, [subjects, saveToStorage]);

  // Delete custom subject (cannot delete default subjects)
  const deleteSubject = useCallback((id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject || subject.type !== SubjectType.CUSTOM) {
      console.warn('Cannot delete default subject');
      return;
    }

    const updatedSubjects = subjects.filter(s => s.id !== id);
    setSubjects(updatedSubjects);
    saveToStorage(updatedSubjects);
  }, [subjects, saveToStorage]);

  // Get subject by ID
  const getSubject = useCallback((id: string): Subject | undefined => {
    return subjects.find(s => s.id === id);
  }, [subjects]);

  // Get subjects by type
  const getSubjectsByType = useCallback((type: SubjectType): Subject[] => {
    return subjects.filter(s => s.type === type);
  }, [subjects]);

  // Get subjects by IDs
  const getSubjectsByIds = useCallback((ids: string[]): Subject[] => {
    return subjects.filter(s => ids.includes(s.id));
  }, [subjects]);

  return {
    subjects,
    loading,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject,
    getSubjectsByType,
    getSubjectsByIds
  };
};