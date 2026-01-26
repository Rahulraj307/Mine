# NgRx: State Management for Enterprise

> **Goal**: Master Store, Effects, Selectors, and the Redux Pattern in Angular.

---

## 1️⃣ Concept Explanation

### Why NgRx?
For complex apps, we need a **Single Source of Truth**.
Input/Output chains become unmanageable (Prop Drilling). NgRx provides a unidirectional data flow.

### The Flow
1.  **Action**: Describes *what happened* (`[Login Page] User Clicked Login`).
2.  **Reducer**: Pure function. Takes (OldState, Action) -> Returns NewState.
3.  **Selector**: Slices and memoizes data from State for the UI.
4.  **Effect**: Side effects (API calls, Navigation) triggered by Actions.

---

## 2️⃣ Code Examples

### Action
```typescript
export const loadUsers = createAction('[User List] Load Users');
export const loadUsersSuccess = createAction(
  '[User API] Load Success',
  props<{ users: User[] }>()
);
```

### Reducer
```typescript
export const userReducer = createReducer(
  initialState,
  on(loadUsersSuccess, (state, { users }) => ({ ...state, users }))
);
```

### Selector
```typescript
export const selectActiveUsers = createSelector(
  selectUserMult,
  (users) => users.filter(u => u.active) // Logic stays out of component
);
```

---

## 3️⃣ Internal Working

NgRx uses **RxJS** heavily.
- The `Store` is just a `BehaviorSubject` that holds a large state tree.
- `Actions` are dispatched into a stream (`actions$`).
- `Reducers` typically use `scan` operator logic to accumulate state.
- `Effects` subscribe to `actions$` stream.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **Store in Components**: Injecting `Store` everywhere. Use Facades or Smart/Dumb pattern.
- **Putting Logic in Effects**: Effects should coordinate, not calculate. Logic belongs in Reducers or Services.

### ⚠️ Production Mistakes
- **Action Reuse**: Reusing `loadUsers` for multiple pages. If one page triggers a reload, another might react unexpectedly. Create unique actions for unique events.
- **Bloated State**: Storing derived data (e.g., `userCount`) in state. Use Selectors to calculate it on the fly.

---

## 5️⃣ Optimization & Best Practices

### Performance
- **Memoization**: Selectors are memoized. If input state hasn't changed, the calculation doesn't run.
- **Normalize State**: Don't store arrays of objects. Store entities `{ ids: [], entities: {} }` (Use `@ngrx/entity`).

### When NOT to use NgRx
- Simple Forms.
- Static Content.
- If your app is just GET/POST without complex interactions between features.
- **Rule of Thumb**: If you have "Shared State", "Race Conditions", or "Complex Undo/Redo", use NgRx.

---

## 6️⃣ Interview QnA

### Beginner
**Q: Reducer vs Effect?**
A: Reducer = Sync state changes (Pure). Effect = Async side effects (API calls).

### Intermediate
**Q: Why use Selectors?**
A: 1. De-couples View from State structure. 2. Performance (Memoization). 3. Reusability.

### Scenario-Based
**Q: How do you handle a generic error in NgRx?**
A: Create a global `[App] API Error` action. Have a Global Effect listing for it to show a Toast Notification. Catch errors in feature effects and map them to this global action.

---

## 7️⃣ Web References

- [NgRx Official Docs](https://ngrx.io/)
- [State Management Best Practices](https://blog.angular-university.io/angular-ngrx-store-best-practices/)
