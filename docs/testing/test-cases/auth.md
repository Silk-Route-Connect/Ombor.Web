# Auth Module (Login / Register / Reset Password) — Manual Browser Test Cases

## Overview

This document covers all user-facing auth flows in the Ombor.Web app (React 19 + MUI v7 + MobX):
- **Login** (`/login`): phone number + password, real backend
- **Register** (`/register`): multi-step form → OTP verification → welcome screen, real backend
- **Reset Password** (`/reset-password`): phone → OTP code → new password → success, mocked at v1 contract

All testing is performed against the DEPLOYED dev environment: frontend **app.miraziz.net** + backend **api.miraziz.net** (MOCKS OFF, real backend). The tenant starts EMPTY. Password reset has no backend endpoint (404 by design); the mock uses demo code **`1234`** (not surfaced in UI).

**Phone format:** 9 national digits (no country code). UI stores as `90123456789` → submits as `+99890123456789` (E.164). Validation and display use `formatNationalPhone()` helper: input accepted/rejected keystroke-by-keystroke, displays as `90 123-45-67`. Masked copy for OTP/reset code screens: `+998 90 •••-••-67`.

**Password:** Minimum 8 characters. No complexity rules.

**Field errors:** Shown inline after submit attempt. On field focus/change, banner/errors clear.

---

## Test Cases

### AUTH-01 · Login — Valid Phone & Password

**Preconditions:** Navigate to `https://app.miraziz.net/login`; user registered with phone `+99890123456789` and password `MyPassword123`.

**Steps:**
1. Observe the page title "Вход в систему" (Login), subtitle, phone field (autofocused), password field, and two buttons: "Войти" (Submit) and "Создать" link (Register).
2. Type `90123456789` in the phone field; observe it formats as `90 123-45-67`.
3. Type `MyPassword123` in the password field; toggle password visibility via the eye icon twice to confirm the text shows and hides.
4. Click "Войти" or press Enter in either field.
5. Observe loading state (button disabled, spinner/reduced opacity).
6. Verify redirect to the app home (e.g., dashboard `/` or the first module route).

**Expected result:**
- Phone input accepts only digits; display format is automatic.
- Password field hides text by default; toggle works.
- Submit is enabled until the request completes.
- Login succeeds, access token is set, redirect happens without UI errors.
- On successful login, user is redirected and the app loads the next routed page (e.g., dashboard).

**Designed gap:** No "remember me" or persistent login without `refresh-token` cookie (secure backend decision). Session dies on browser close or refresh timeout.

---

### AUTH-02 · Login — Invalid Phone Format

**Preconditions:** Navigate to `/login`.

**Steps:**
1. Click the phone field and type `901234567` (8 digits, short by 1).
2. Click "Войти" without filling the password field.
3. Observe error banner and inline error messages.

**Expected result:**
- Password error: "Обязательное поле" (Required field) inline below password field.
- Phone error: "Введите номер в формате +998 XX XXX-XX-XX" (Invalid phone format) inline below phone field.
- Error banner: "Не удалось создать аккаунт. Попробуйте позже." [sic; this may be a register banner, expected: auth-generic error or focus on field errors].
- Button remains enabled (hard rule: never disable on client validation).
- On field change, banner clears.

**Designed gap:** Error banner may show a generic/legacy message; the authoritative errors are inline per field.

---

### AUTH-03 · Login — Invalid Password (Wrong Password)

**Preconditions:** User registered with `90123456789` and password `CorrectPassword123`. Navigate to `/login`.

**Steps:**
1. Enter phone `90123456789`.
2. Enter password `WrongPassword123`.
3. Click "Войти".
4. Observe server response.

**Expected result:**
- Error banner: "Неверный номер или пароль. Проверьте данные и попробуйте снова." (Invalid phone or password. Check your data and try again.)
- Button returns to enabled state.
- User stays on login page.
- No sensitive info leakage (message does not say "wrong password" or "user not found").

---

### AUTH-04 · Login — Empty Phone & Password

**Preconditions:** Navigate to `/login`.

**Steps:**
1. Leave both fields empty.
2. Click "Войти".

**Expected result:**
- Phone error: "Введите номер телефона" (Enter phone number).
- Password error: "Обязательное поле" (Required field).
- No server call is made.
- Button remains enabled.

---

### AUTH-05 · Login → Forgot Password Link

**Preconditions:** Navigate to `/login`.

**Steps:**
1. Observe the "Забыли пароль?" (Forgot password?) link below the password field.
2. Click "Забыли пароль?".

**Expected result:**
- Navigate to `/reset-password`.
- Page title is "Восстановление пароля" (Password recovery).
- Phone field (empty, autofocused).
- "Отправить код" (Send code) button.
- "Вернуться ко входу" (Return to login) back link.

---

### AUTH-06 · Login → Register Link

**Preconditions:** Navigate to `/login`.

**Steps:**
1. Observe the line below the login button: "Нет аккаунта?" (No account?) with "Создать" (Create) link.
2. Click "Создать".

**Expected result:**
- Navigate to `/register`.
- Page shows the registration form (company, first name, last name, phone, password, confirm password, terms checkbox).

---

### AUTH-07 · Register — Valid Form (All Fields Correct)

**Preconditions:** Navigate to `/register`. Ensure no user exists with the phone number you will use.

**Steps:**
1. Observe sections: "Бизнес" (Business), then "Аккаунт" (Account).
2. Enter company name: `Nikitinov Bazar` (or any non-empty string).
3. Enter first name: `Bakhrom`.
4. Enter last name: `Saidov`.
5. Enter phone: `90123456789` (or any valid unused number).
6. Enter password: `MyPassword123` (≥8 chars).
7. Enter confirm password: `MyPassword123`.
8. Check the terms checkbox (colored teal when checked, icon shows ✓).
9. Click "Создать аккаунт" (Create account).
10. Observe loading state.
11. On server success, navigate to the OTP step (same page, step changes to "otp").

**Expected result:**
- Page title becomes "Введите код" (Enter code).
- Subtitle: "Мы отправили 4-значный код на +998 90 •••-••-67".
- Four OTP input cells (each accepts one numeric digit).
- Below cells: "Не получили код?" (Didn't get the code?) with "Отправить ещё раз" (Resend) or "Отправить ещё раз через 60 сек" (Resend in 60 sec) countdown.
- "Подтвердить" (Verify) button.
- "Изменить номер" (Change phone) back link.
- A notification toast: "Код отправлен на +998 90 •••-••-67" (Code sent to [masked phone]).

**Designed gap:** The `email` and `telegramAccount` fields are still accepted by the backend model but omitted from the UI per product-owner decision.

---

### AUTH-08 · Register — Company Name Required

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Leave company name empty.
2. Fill first name, last name, phone, password (both), check terms.
3. Click "Создать аккаунт".

**Expected result:**
- Error banner at the top: "Проверьте отмеченные поля перед продолжением." (Check the marked fields before continuing.)
- Inline error below company field: "Обязательное поле" (Required field).
- No server call.
- Button enabled.

---

### AUTH-09 · Register — First Name Required

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Leave first name empty.
2. Fill all other fields (company, last name, phone, password, confirm, terms).
3. Click "Создать аккаунт".

**Expected result:**
- Error banner: "Проверьте отмеченные поля перед продолжением."
- Inline error below first name field: "Обязательное поле".
- No server call.

---

### AUTH-10 · Register — Last Name Required

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Leave last name empty.
2. Fill all other fields.
3. Click "Создать аккаунт".

**Expected result:**
- Error banner displayed.
- Inline error: "Обязательное поле".
- No server call.

---

### AUTH-11 · Register — Phone Required & Validated

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Leave phone empty; submit.
2. Observe error; go back and enter `901234567` (8 digits).
3. Click "Создать аккаунт".

**Expected result (empty):**
- Inline error: "Введите номер телефона" (Enter phone number).

**Expected result (8 digits):**
- Inline error: "Введите номер в формате +998 XX XXX-XX-XX" (Enter number in format …).

---

### AUTH-12 · Register — Password Too Short

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Fill company, first name, last name, phone.
2. Enter password: `Short12` (7 characters).
3. Enter confirm password: `Short12`.
4. Check terms, click "Создать аккаунт".

**Expected result:**
- Inline error below password field: "Минимальная длина пароля — 8 символов" (Minimum password length — 8 characters).
- No server call.

---

### AUTH-13 · Register — Password Mismatch

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Fill all required fields (company, names, phone).
2. Enter password: `MyPassword123`.
3. Enter confirm password: `MyPassword456`.
4. Check terms, click "Создать аккаунт".

**Expected result:**
- Inline error below confirm password field: "Пароли не совпадают" (Passwords do not match).
- No server call.

---

### AUTH-14 · Register — Terms Not Checked

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Fill all fields (company, names, phone, password, confirm).
2. Leave terms checkbox **unchecked**.
3. Click "Создать аккаунт".

**Expected result:**
- Error banner: "Проверьте отмеченные поля перед продолжением."
- Terms checkbox border turns red (error state).
- No server call.

---

### AUTH-15 · Register — Terms Checkbox Toggle

**Preconditions:** Navigate to `/register` with the form filled.

**Steps:**
1. Observe the terms checkbox (unchecked, gray border).
2. Click the checkbox.
3. Observe the checkbox (checked, teal border, white ✓).
4. Click again to uncheck.
5. Observe the checkbox (unchecked again).

**Expected result:**
- Checkbox state toggles cleanly.
- Color changes (gray ↔ teal).
- Check icon appears/disappears.

---

### AUTH-16 · Register → OTP Step — Code Resend Countdown

**Preconditions:** Complete registration form and submit; page shows the OTP step.

**Steps:**
1. Observe the resend text: "Отправить ещё раз через 60 сек" (disabled, gray).
2. Wait ~10 seconds.
3. Observe the countdown decrement: 59, 58, 57, ... secs.
4. Wait for countdown to reach 0.
5. Observe the text changes to "Отправить ещё раз" (blue, clickable).
6. Click "Отправить ещё раз".
7. Observe loading state on the resend action.
8. On success, countdown restarts to 60.

**Expected result:**
- Countdown is live and accurate.
- Resend button is disabled while countdown > 0, enabled when countdown = 0.
- Clicking resend triggers a new code dispatch (notification toast: "Код отправлен повторно").
- Countdown restarts.
- Old code cells remain as entered (not cleared by resend).

---

### AUTH-17 · Register → OTP Step — Valid Code

**Preconditions:** Registered user; at the OTP step; the code is `1234` (or the backend SMS'd the real code).

**Steps:**
1. Click the first OTP cell (autofocused).
2. Type `1` → cell updates, focus moves to cell 2.
3. Type `2` → cell 2 updates, focus moves to cell 3.
4. Type `3` → cell 3 updates, focus moves to cell 4.
5. Type `4` → cell 4 updates.
6. Observe all cells filled.
7. Click "Подтвердить" (Verify).
8. Observe loading state.
9. On success, page navigates to the welcome step.

**Expected result:**
- Each cell accepts one digit; non-digits are ignored.
- Auto-advance between cells works.
- "Подтвердить" button is enabled once all 4 cells are filled.
- On submit, the backend verifies the code.
- Redirect to the welcome screen (welcome step).

---

### AUTH-18 · Register → OTP Step — Code Paste

**Preconditions:** At the OTP step.

**Steps:**
1. Copy the code `1234` to clipboard.
2. Click the first OTP cell.
3. Paste (Ctrl+V or Cmd+V).
4. Observe all four cells populate.

**Expected result:**
- Paste handler accepts the full code.
- All cells update in one action.
- Non-digits in the pasted string are filtered out.
- First cell receives focus or the last filled cell receives focus.

---

### AUTH-19 · Register → OTP Step — Incomplete Code

**Preconditions:** At the OTP step.

**Steps:**
1. Enter only `123` (3 digits).
2. Click "Подтвердить".

**Expected result:**
- Inline error below cells: "Введите 4-значный код" (Enter a 4-digit code).
- No server call.
- Cells are not cleared.

---

### AUTH-20 · Register → OTP Step — Invalid Code

**Preconditions:** At the OTP step.

**Steps:**
1. Enter code `9999` (not the real code).
2. Click "Подтвердить".
3. Observe server response.

**Expected result:**
- No inline error shown initially; the submit is attempted.
- Server returns failure.
- Code cells are cleared.
- Cells remain focused (or first cell refocused).
- `tried` state is set so if the user re-enters, errors will show again (per the component logic, `codeTried` is set to true).
- User can re-enter or click "Изменить номер" to go back to the phone step.

**Designed gap:** The exact error message from the backend on invalid code may vary; the current UI clears the code and allows retry without an explicit banner (per `RegisterPage` logic: `setCode("")` but no banner set).

---

### AUTH-21 · Register → OTP Step — Change Phone

**Preconditions:** At the OTP step.

**Steps:**
1. Click "Изменить номер" (Change phone).

**Expected result:**
- Page navigates back to the form step (same URL, step = "form").
- All form fields retain their previous values (company, names, password, confirm, terms).
- Phone field is **cleared**.
- First field (company) is **not** autofocused; phone will need to be re-entered.
- User can edit and re-submit.

**Designed gap:** Form state is preserved when going back; phone is cleared to encourage re-entry.

---

### AUTH-22 · Register → Welcome Step — Display

**Preconditions:** OTP verified; navigated to the welcome step.

**Steps:**
1. Observe the page.
2. A success badge (green ring + white checkmark) is centered at the top.
3. Title: "Добро пожаловать в Ombor!" (Welcome to Ombor!).
4. Subtitle: "Аккаунт «Nikitinov Bazar» успешно создан" (Account "[company]" successfully created).
5. Below, three cards (each with an icon + number + title + body):
   - 1. **Добавьте товары** (Add products) — "Создайте каталог вашей продукции" (Create your product catalog).
   - 2. **Внесите партнёров** (Add partners) — "Клиенты и поставщики в одном списке" (Clients and suppliers in one list).
   - 3. **Создайте склад** (Create warehouse) — "Настройте склады и начальные остатки" (Configure warehouses and initial stock).
6. Blue "Начать работу" (Start working) button.

**Expected result:**
- All text, icons, and layout match the design.
- Onboarding cards are informational only (not clickable).
- Button is prominent and enabled.

---

### AUTH-23 · Register → Welcome Step → Start Working

**Preconditions:** At the welcome step after OTP verification.

**Steps:**
1. Click "Начать работу" (Start working).
2. Observe loading state.

**Expected result:**
- AuthStore commits the access token via `enterWithTokens()`.
- User is redirected to the app home (e.g., `/dashboard` or `/`).
- The app initializes and shows the first routed page (no auth guard bounce).
- User is now fully logged in and can access protected routes.

---

### AUTH-24 · Reset Password — Send Code to Phone

**Preconditions:** Navigate to `/reset-password`. A user exists with phone `90123456789`.

**Steps:**
1. Observe page title: "Восстановление пароля" (Password recovery).
2. Subtitle: "Введите номер телефона — отправим код подтверждения" (Enter phone number — we'll send a verification code).
3. Phone field (autofocused, empty).
4. "Отправить код" (Send code) button.
5. "Вернуться ко входу" (Return to login) back link.
6. Enter phone: `90123456789`.
7. Click "Отправить код" or press Enter.
8. Observe loading state.
9. On success, page navigates to the code step.

**Expected result:**
- Phone input accepts and formats digits.
- Button is enabled until submission.
- On success, notification toast: "Код отправлен на +998 90 •••-••-67" (Code sent to [masked phone]).
- Page step changes to "code".
- Countdown timer starts at 60 seconds for resend.

---

### AUTH-25 · Reset Password — Phone Validation

**Preconditions:** Navigate to `/reset-password`.

**Steps:**
1. Enter phone `901234567` (8 digits).
2. Click "Отправить код".

**Expected result:**
- Inline error: "Введите номер в формате +998 XX XXX-XX-XX".
- No server call.

---

### AUTH-26 · Reset Password — Empty Phone

**Preconditions:** Navigate to `/reset-password`.

**Steps:**
1. Leave phone empty.
2. Click "Отправить код".

**Expected result:**
- Inline error: "Введите номер телефона" (Enter phone number).
- No server call.

---

### AUTH-27 · Reset Password — Return to Login

**Preconditions:** Navigate to `/reset-password`.

**Steps:**
1. Click "Вернуться ко входу" (Return to login).

**Expected result:**
- Navigate to `/login`.
- Page title: "Вход в систему".

---

### AUTH-28 · Reset Password → Code Step — Valid Code

**Preconditions:** At the reset code step (after sending code to phone).

**Steps:**
1. Observe: "Введите код" (Enter code), subtitle with masked phone.
2. Four OTP cells, "Подтвердить" button, resend timer.
3. Enter code `1234` (the mocked demo code).
4. Click "Подтвердить".
5. Observe loading state.
6. On success, page navigates to the new password step.

**Expected result:**
- Code verification succeeds.
- Step changes to "newpass".
- Page shows "Новый пароль" (New password) title and subtitle.
- Two password fields: "Новый пароль" (New password) and "Подтверждение пароля" (Confirm password).
- "Сменить пароль" (Change password) button.
- "Вернуться ко входу" (Return to login) back link.

**Designed gap:** Password reset endpoints return 404 by design; the mocked contract uses code `1234` (never shown in UI, only documented here).

---

### AUTH-29 · Reset Password → Code Step — Invalid Code

**Preconditions:** At the reset code step.

**Steps:**
1. Enter code `9999`.
2. Click "Подтвердить".

**Expected result:**
- Server returns failure (mocked or real).
- Code cells are cleared.
- User remains on the code step.
- Can retry or click "Изменить номер" to go back.

---

### AUTH-30 · Reset Password → Code Step — Change Phone

**Preconditions:** At the reset code step.

**Steps:**
1. Click "Изменить номер" (Change phone).

**Expected result:**
- Navigate back to the phone step (step = "phone").
- Phone field is cleared.
- Countdown is reset.
- User can enter a different phone and resend the code.

---

### AUTH-31 · Reset Password → Code Step — Resend Code

**Preconditions:** At the reset code step; resend countdown is at 0 (≥60 seconds elapsed or manually skipped for testing).

**Steps:**
1. Wait for or observe the countdown reach 0.
2. Click "Отправить ещё раз" (blue, clickable).
3. Observe loading state.
4. On success, notification toast: "Код отправлен на +998 90 •••-••-67".
5. Countdown restarts to 60.

**Expected result:**
- Resend works.
- Timer resets.
- Code cells are not cleared by resend (user can still see previous entry if any).

---

### AUTH-32 · Reset Password → New Password Step — Valid Password

**Preconditions:** At the new password step (code verified).

**Steps:**
1. Observe fields: "Новый пароль" (New password, autofocused), "Подтверждение пароля" (Confirm password).
2. Placeholder text: "Минимум 8 символов" (Minimum 8 characters).
3. Enter new password: `NewPassword123`.
4. Enter confirm password: `NewPassword123`.
5. Click "Сменить пароль" (Change password) or press Enter in confirm field.
6. Observe loading state.
7. On success, page navigates to the success step.

**Expected result:**
- Passwords are accepted.
- Button is enabled until submission.
- On success, step changes to "success".
- Page shows success badge + title "Пароль изменён" (Password changed).

---

### AUTH-33 · Reset Password → New Password Step — Password Too Short

**Preconditions:** At the new password step.

**Steps:**
1. Enter new password: `Short12` (7 chars).
2. Enter confirm: `Short12`.
3. Click "Сменить пароль".

**Expected result:**
- Inline error below new password field: "Минимальная длина пароля — 8 символов".
- No server call.

---

### AUTH-34 · Reset Password → New Password Step — Passwords Don't Match

**Preconditions:** At the new password step.

**Steps:**
1. Enter new password: `NewPassword123`.
2. Enter confirm: `NewPassword456`.
3. Click "Сменить пароль".

**Expected result:**
- Inline error below confirm password field: "Пароли не совпадают" (Passwords do not match).
- No server call.

---

### AUTH-35 · Reset Password → New Password Step — Empty Password

**Preconditions:** At the new password step.

**Steps:**
1. Leave both fields empty.
2. Click "Сменить пароль".

**Expected result:**
- Inline errors: "Обязательное поле" (Required field) below both fields.
- No server call.

---

### AUTH-36 · Reset Password → Success Step

**Preconditions:** New password successfully changed.

**Steps:**
1. Observe page.
2. Success badge (green ring + checkmark).
3. Title: "Пароль изменён" (Password changed).
4. Subtitle: "Теперь войдите в систему с новым паролем" (Now log in with your new password).
5. "Войти" (Login) button.

**Expected result:**
- Success page displays correctly.
- All elements present.

---

### AUTH-37 · Reset Password → Success Step → Back to Login

**Preconditions:** At the success step.

**Steps:**
1. Click "Войти" (Login).

**Expected result:**
- Navigate to `/login`.
- User can now log in with the new password.

---

### AUTH-38 · Login After Password Reset

**Preconditions:** User has just reset password and is at the success page.

**Steps:**
1. Click "Войти".
2. At the login page, enter phone: `90123456789`.
3. Enter the new password: `NewPassword123`.
4. Click "Войти".

**Expected result:**
- Login succeeds with the new password.
- Redirect to app home.
- Old password no longer works (if tested separately).

---

### AUTH-39 · Phone Field — Keystroke Formatting

**Preconditions:** Any auth page with a phone field.

**Steps:**
1. Click the phone field.
2. Type the following keystrokes sequentially: `9`, `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`.
3. Observe the field value after each keystroke.

**Expected result:**
- Keystroke 1 (`9`): displays `9`.
- Keystroke 2 (`0`): displays `90`.
- Keystroke 3 (`1`): displays `90 1`.
- Keystroke 4 (`2`): displays `90 12`.
- Keystroke 5 (`3`): displays `90 123`.
- Keystroke 6 (`4`): displays `90 123-45`.
- Keystroke 7 (`5`): displays `90 123-45-5`.
- Keystroke 8 (`6`): displays `90 123-45-56`.
- Keystroke 9 (`7`): displays `90 123-45-67`.
- Keystroke 10 (`8`): field caps at 9 digits, no change.
- Keystroke 11 (`9`): field caps at 9 digits, no change.
- Observe that the underlying state stores only digits: `901234567`, capped at 9.

**Expected result:**
- Phone formatting is live and follows the `formatNationalPhone()` pattern.
- Non-digits are rejected (e.g., typing `-`, `.`, `)` has no effect).
- The display format is automatic; the user only types digits.
- Backspace/delete works; formatting re-applies on the reduced string.

---

### AUTH-40 · Password Field — Visibility Toggle

**Preconditions:** Any auth page with a password field.

**Steps:**
1. Click the password field.
2. Type `MyPassword123`.
3. Observe the password is hidden (dots or masking).
4. Click the eye icon at the right of the password field.
5. Observe the password is now visible as plain text.
6. Click the eye icon again.
7. Observe the password is hidden again.

**Expected result:**
- Password field type toggles between `password` and `text`.
- Eye icon shows/hides accordingly (closed eye vs. open eye).
- Text cursor and caret position remain stable through toggles.
- Password value is not lost.

---

### AUTH-41 · Keyboard Navigation — Enter Key Submits

**Preconditions:** Navigate to `/login`.

**Steps:**
1. Enter phone: `90123456789`.
2. Press Tab to move to password field.
3. Enter password: `MyPassword123`.
4. Press Enter (from password field).

**Expected result:**
- Form submits (login attempt initiated).
- Loading state shows on button.
- Login proceeds as if the button was clicked.

---

### AUTH-42 · Keyboard Navigation — OTP Code Entry with Tab/Arrows

**Preconditions:** At the OTP step (register or reset).

**Steps:**
1. Click the first OTP cell (autofocused).
2. Type `1` → cell 1 filled, focus moves to cell 2.
3. Use arrow right → focus on cell 3 (skipping cell 2 if auto-advance didn't move there).
4. Type `2` → cell 3 filled.
5. Use arrow left → focus moves back to cell 2.
6. Type `3` → cell 2 filled.
7. Use Backspace in cell 3 while empty → focus moves to cell 2.

**Expected result:**
- Arrow keys navigate left/right between cells.
- Backspace from an empty cell moves focus to the previous cell.
- Auto-advance on digit entry works as expected.
- User can navigate and edit cells fluidly.

---

### AUTH-43 · Field Error States — Visual Consistency

**Preconditions:** Navigate to any auth form (login, register, or reset).

**Steps:**
1. Leave a required field empty.
2. Click "Войти" / "Создать аккаунт" / "Отправить код".
3. Observe the field with the error.

**Expected result:**
- Field border is red (error.main color).
- Field background is light red (error bg token).
- Error icon (⚠) appears below the field in red.
- Error message text is red.
- Label is not red (remains normal weight/color).

---

### AUTH-44 · Error Banner — Clear on Field Change

**Preconditions:** Login or register page showing an error banner.

**Steps:**
1. Observe the error banner at the top.
2. Click on any form field and type/change the value.

**Expected result:**
- Error banner disappears immediately.
- Field-level errors remain until the field is edited.

---

### AUTH-45 · Link Navigation — Styling & Behavior

**Preconditions:** Any auth page with a link (e.g., "Создать", "Забыли пароль?", "Изменить номер").

**Steps:**
1. Observe link styling (teal color, no underline).
2. Hover over the link.
3. Observe underline appears.
4. Click the link.

**Expected result:**
- Links are teal (primary.main).
- Underline appears on hover.
- Cursor changes to pointer.
- Click navigates or triggers the action.

---

### AUTH-46 · Register — Terms Link Placeholders

**Preconditions:** Register page.

**Steps:**
1. Observe the terms text: "Я принимаю условия использования и политику конфиденциальности" (I accept terms of use and privacy policy).
2. "условия использования" (terms of use) is a teal link.
3. "политику конфиденциальности" (privacy policy) is a teal link.
4. Click each link.

**Expected result:**
- Links are styled correctly (teal, underline on hover).
- Current behavior: clicking a terms link does nothing (no handler wired; placeholders per the code: `onClick={() => undefined}`).
- No navigation or modal (by design, terms pages deferred).

**Designed gap:** Terms/privacy links are placeholders; no actual pages exist yet.

---

### AUTH-47 · OTP Code Paste — Edge Cases

**Preconditions:** At the OTP step.

**Steps:**
1. Copy a string like `1-2.3 4` (mixed digits and non-digits) to clipboard.
2. Click the first OTP cell.
3. Paste.

**Expected result:**
- Only digits are extracted: `1234`.
- All four cells populate.
- Non-digit characters are filtered out by the paste handler.

---

### AUTH-48 · Phone Format — Paste & Backspace

**Preconditions:** Login page.

**Steps:**
1. Copy `90123456789` to clipboard.
2. Click the phone field.
3. Paste.
4. Observe the field displays `90 123-45-67`.
5. Select all (Ctrl+A) and delete.
6. Observe the field is empty.
7. Type just `9`.
8. Observe the field displays `9`.

**Expected result:**
- Paste correctly interprets and formats the phone number.
- Delete/select-all works as expected.
- Format re-applies when typing.

---

### AUTH-49 · Session Handling — Token Persistence

**Preconditions:** User logged in successfully; page shows the app (e.g., dashboard).

**Steps:**
1. Open browser DevTools (F12 or Cmd+Option+I).
2. Go to the Application / Storage tab.
3. Check Local Storage for key `ombor.locale` (i18n preference).
4. Check Cookies for `refresh-token` or similar auth cookie (backend-set, httpOnly).
5. Observe the access token is stored in memory only (AuthStore.accessToken, not localStorage or cookies).

**Expected result:**
- Refresh token is an httpOnly cookie (secure, not visible in JavaScript).
- Access token is in memory (not persisted, cleared on page reload).
- i18n locale is in localStorage (persistent across sessions).
- On page reload, bootstrap() attempts silent refresh via the refresh-token cookie.

**Designed gap:** Access token is memory-only; on refresh, if the refresh-token cookie is valid, a new access token is obtained. If the cookie expires, the user is logged out and redirected to `/login`.

---

### AUTH-50 · Login — Case Sensitivity

**Preconditions:** User registered with phone `90123456789`.

**Steps:**
1. Navigate to `/login`.
2. Enter phone `90123456789` (correct).
3. Enter password `MyPassword123`.
4. Click "Войти"; note success.
5. Logout (e.g., via the app UI).
6. Return to login.
7. Enter phone `90123456789`.
8. Enter password `mypassword123` (lowercase 'm' instead of 'M').
9. Click "Войти".

**Expected result:**
- First attempt succeeds (correct password).
- Second attempt fails with "Неверный номер или пароль" (passwords are case-sensitive).
- Backend authentication is case-sensitive for passwords.

---

### AUTH-51 · Register — Whitespace Trimming

**Preconditions:** Navigate to `/register`.

**Steps:**
1. Enter company name: `  Nikitinov Bazar  ` (spaces before/after).
2. Enter first name: `  Bakhrom  `.
3. Enter last name: `  Saidov  `.
4. Fill phone, password, confirm, check terms.
5. Click "Создать аккаунт".

**Expected result:**
- Server receives trimmed values: `Nikitinov Bazar`, `Bakhrom`, `Saidov` (not with leading/trailing spaces).
- Fields appear to accept spaces; submit normalizes them via `.trim()` before sending.

---

### AUTH-52 · Browser Back Button — Form State

**Preconditions:** Register page; form partially filled.

**Steps:**
1. Fill some fields (company, first name).
2. Click browser back button.
3. Observe navigation to the previous page (e.g., login or home if starting from login).
4. Click browser forward button.
5. Navigate to `/register` again.

**Expected result:**
- Browser back clears the page state (form is reset).
- Returning to `/register` shows a fresh, empty form.
- Form state is not persisted to localStorage.

**Designed gap:** Form data is lost on navigation; no auto-save or draft recovery.

---

### AUTH-53 · Mobile Responsiveness — Phone Field

**Preconditions:** Open the login page on a mobile device (< 600px width) or use DevTools mobile emulation.

**Steps:**
1. Observe the phone field and its label.
2. Click the phone field to focus.
3. Type a phone number.
4. Observe the keyboard that appears (should be numeric, not QWERTY).

**Expected result:**
- Phone field has `inputMode="tel"` and `autoComplete="tel"`, so the mobile keyboard is numeric.
- The field layout remains usable on mobile (label above, field full-width).
- Text is readable and touch-friendly.

---

### AUTH-54 · Error Message i18n Keys — Russian UI

**Preconditions:** Login page with language set to Russian (default).

**Steps:**
1. Leave phone empty, click submit.
2. Observe the error message.

**Expected result:**
- Error message is in Russian: "Введите номер телефона" (not an i18n key literal like `auth.errors.phoneRequired`).
- All error messages, labels, buttons, and text use the `ru` i18n namespace.

---

### AUTH-55 · Notification Toast — OTP Sent

**Preconditions:** Complete registration form and submit; OTP step is reached.

**Steps:**
1. Observe a toast notification at the top or bottom of the screen.
2. Read the message: "Код отправлен на +998 90 •••-••-67" (Code sent to [masked phone]).
3. Observe the toast auto-dismisses after ~3-5 seconds.

**Expected result:**
- Toast appears with success styling (green background or icon).
- Message is informative and non-intrusive.
- Toast disappears automatically or can be dismissed manually.

---

### AUTH-56 · Loading State — Button Disabled During Submit

**Preconditions:** Login page; form filled and ready to submit.

**Steps:**
1. Hover over the "Войти" button; note normal styling.
2. Click "Войти".
3. Immediately observe the button state.
4. Observe the button is disabled (opacity reduced or cursor changes to not-allowed).
5. Wait for the response (success or error).
6. Button returns to enabled state.

**Expected result:**
- Button is disabled (`disabled` attribute set) during the request.
- User cannot double-click or spam-submit.
- Button is re-enabled after the response (success or error).

---

### AUTH-57 · Register Form Reset on Back from OTP

**Preconditions:** Register form filled; navigated to OTP step; clicked "Изменить номер".

**Steps:**
1. At the form step again (step = "form").
2. Observe the company, first name, last name fields retain their previous values.
3. Observe the phone field is **cleared** (empty).
4. Observe the password and confirm fields retain their previous values.
5. Observe the terms checkbox retains its checked state.

**Expected result:**
- Form fields are preserved except phone (which is cleared to encourage re-entry).
- User can modify any field and re-submit.

---

### AUTH-58 · Caps Lock Warning (Not Currently Implemented)

**Preconditions:** Login or register page; password field.

**Steps:**
1. Click the password field.
2. Activate Caps Lock on the keyboard.
3. Type a character (or leave empty and observe).

**Expected result:**
- Current implementation: **no Caps Lock warning is shown** (the i18n key `auth.capsLockOn` exists but the UI does not detect or display it).
- This is a known gap (the feature is not wired in the current password field component).

**Designed gap:** Caps Lock detection not implemented.

---

### AUTH-59 · No User — Phone Not Registered

**Preconditions:** Login page.

**Steps:**
1. Enter phone `99999999999` (or any non-existent phone).
2. Enter password `SomePassword123`.
3. Click "Войти".

**Expected result:**
- Server returns an error (user not found or invalid credentials).
- Error banner: "Неверный номер или пароль. Проверьте данные и попробуйте снова." (no differentiation between user-not-found and wrong-password).
- User stays on login page.

**Designed gap:** Error message does not reveal whether the phone is registered or the password is wrong (security by obfuscation).

---

### AUTH-60 · Accessibility — Focus Order

**Preconditions:** Login page.

**Steps:**
1. Press Tab repeatedly to navigate through the form.
2. Observe the focus order: phone field → password field → "Войти" button → "Забыли пароль?" link → "Нет аккаунта?" line with "Создать" link.
3. Verify each focusable element is reachable.

**Expected result:**
- Tab order is logical and left-to-right, top-to-bottom.
- All interactive elements are keyboard-reachable.
- Focus outline is visible (blue ring, MUI default).

---

## Reconciliation Notes

The Auth module does not directly mutate backend state (products, partners, transactions, wallets, debts). The reconciliation scope is limited to:

1. **Login Success:** AuthStore commits the access token → user is authenticated → subsequent API calls include the token in the Authorization header.
2. **Register Success:** A new user and tenant are created in the backend; the user is authenticated and can access the app.
3. **Password Reset Success:** User can log in with the new password; the old password no longer works.
4. **Token Refresh:** On 401 or app bootstrap, the refresh-token cookie is sent to the backend; a new access token is returned if the cookie is valid.

No backend assertions are needed for the Auth module tests themselves. However, after a successful register or login:
- **Cross-module check:** Navigate to a protected route (e.g., `/products`). Verify the page loads (no 401 bounce back to `/login`). This confirms the token is valid and accepted by the backend.
- **Logout & re-login check:** Use the app UI to log out (if available). Verify redirect to `/login`. Verify login works with the same credentials.

---

## Known Designed Gaps

1. **No Caps Lock Detection:** The password field component does not detect or warn about Caps Lock. The i18n key exists but is unused.
2. **No Terms Pages:** The terms and privacy links are placeholders; no actual pages exist. Clicking them does nothing.
3. **Password Reset Uses Mocked Demo Code:** The `/reset-password` flow uses endpoints that return 404 on the real backend. The MSW mock accepts code `1234` (not shown in UI, for testing only).
4. **Email & Telegram Omitted from Register UI:** The backend still accepts `email` and `telegramAccount` in the RegisterRequest, but the UI does not expose these fields (product-owner decision).
5. **No Audit Logging for Auth Events:** Login/register/reset are not logged as audit trail events (out of MVP scope).
6. **No Password Complexity Rules:** Password validation only checks length (≥8 chars), not complexity (uppercase, lowercase, numbers, symbols).
7. **No "Remember Me":** The access token is memory-only; sessions clear on browser close or refresh timeout.
8. **No Two-Factor Authentication:** The app relies on phone+password; no TOTP, SMS MFA, or email verification (out of MVP).
9. **No Account Recovery Without Phone:** If a user loses phone access, there is no alternative recovery flow (out of MVP).
10. **No Email Confirmation:** Registration does not require email verification (email field is omitted anyway).
11. **No Rate Limiting or Brute-Force Protection Visible:** The UI does not show rate-limit errors or account lockout warnings (backend may enforce them silently).
12. **Error Banner May Show Legacy Text:** The register error banner i18n key may be reused from login; exact wording may vary.
