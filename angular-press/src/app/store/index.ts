import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';

export interface AppState {
  // Feature states will be added here
}

export const reducers: ActionReducerMap<AppState> = {
  // Feature reducers will be added here
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];