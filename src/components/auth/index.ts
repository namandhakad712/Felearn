// Re-export all auth components
import AuthButtonsComponent from './AuthButtons';
import AuthStateDisplayComponent from './AuthStateDisplay';
import LoginFormComponent from './LoginForm';
import PersistenceSelectorComponent from './PersistenceSelector';
import RegistrationFormComponent from './RegistrationForm';

// Named exports
export const AuthButtons = AuthButtonsComponent;
export const AuthStateDisplay = AuthStateDisplayComponent;
export const LoginForm = LoginFormComponent;
export const PersistenceSelector = PersistenceSelectorComponent;
export const RegistrationForm = RegistrationFormComponent;

// Default export
export default {
  AuthButtons: AuthButtonsComponent,
  AuthStateDisplay: AuthStateDisplayComponent,
  LoginForm: LoginFormComponent,
  PersistenceSelector: PersistenceSelectorComponent,
  RegistrationForm: RegistrationFormComponent
};