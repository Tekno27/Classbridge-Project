import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, Class, LessonNote, Assignment, Submission, Question, Activity } from '@/types';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  classes: Class[];
  lessons: LessonNote[];
  assignments: Assignment[];
  submissions: Submission[];
  questions: Question[];
  activities: Activity[];
  isLoading: boolean;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CLASSES'; payload: Class[] }
  | { type: 'ADD_CLASS'; payload: Class }
  | { type: 'SET_LESSONS'; payload: LessonNote[] }
  | { type: 'ADD_LESSON'; payload: LessonNote }
  | { type: 'UPDATE_LESSON'; payload: LessonNote }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'SET_SUBMISSIONS'; payload: Submission[] }
  | { type: 'UPDATE_SUBMISSION'; payload: Submission }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'ADD_QUESTION'; payload: Question }
  | { type: 'UPDATE_QUESTION'; payload: Question }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity };

const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  classes: [],
  lessons: [],
  assignments: [],
  submissions: [],
  questions: [],
  activities: [],
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CLASSES':
      return { ...state, classes: action.payload };
    case 'ADD_CLASS':
      return { ...state, classes: [...state.classes, action.payload] };
    case 'SET_LESSONS':
      return { ...state, lessons: action.payload };
    case 'ADD_LESSON':
      return { ...state, lessons: [...state.lessons, action.payload] };
    case 'UPDATE_LESSON':
      return {
        ...state,
        lessons: state.lessons.map((l) => (l.id === action.payload.id ? action.payload : l)),
      };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.payload] };
    case 'SET_SUBMISSIONS':
      return { ...state, submissions: action.payload };
    case 'UPDATE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'ADD_QUESTION':
      return { ...state, questions: [...state.questions, action.payload] };
    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map((q) => (q.id === action.payload.id ? action.payload : q)),
      };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (initializer) => {
    // Load auth state from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cb_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser) as User;
          return { ...initializer, currentUser: user, isAuthenticated: true };
        } catch {
          // ignore
        }
      }
    }
    return initializer;
  });

  // Persist auth to localStorage
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('cb_user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('cb_user');
    }
  }, [state.currentUser]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
