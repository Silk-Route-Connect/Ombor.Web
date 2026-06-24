# Settings Module — Browser Test Cases

**Module:** Settings (Настройки)  
**Route:** `/settings`  
**Environment:** dev.app.miraziz.net (frontend) + api.miraziz.net (backend)  
**UI Language:** Russian  
**Tenant State:** Empty at start; builds up during testing  

---

## Overview

The Settings module is a single-page interface at `/settings` for managing organization profile, interface language, currency (read-only), and tenant users. The page has four sections with sticky left-side navigation (scroll-spy active link):

1. **Организация** (Organization) — editable name, address, phone, email, logo with multipart upload
2. **Язык** (Language) — immediate per-user i18n switching (ru / uz)
3. **Валюта** (Currency) — read-only UZS informational card
4. **Пользователи** (Users) — invite / deactivate / reactivate (never delete, rule 41)

Changes to Organization are staged in a draft and saved via the sticky bottom **Save bar** (Сохранить / Отменить), which displays dirty/clean status. Language changes apply immediately. Users actions (invite, deactivate, reactivate) apply immediately. The backend is fully mocked at the target v1 contract (`/api/settings/*`).

---

## Test Cases

### SETTINGS-01: Page Load & Navigation

**Title:** Initial page load and sticky section navigation

**Preconditions:**
- User is logged in and navigated to `/settings`
- Tenant has 1 active admin (self) + 3 others (2 active, 1 deactivated)

**Steps:**
1. Open the Settings page
2. Verify the page displays a loading spinner while fetching organization + users
3. Once loaded, verify the left sticky nav shows four icons + labels: Организация, Язык, Валюта, Пользователи
4. Verify the active section defaults to Организация (highlighted with primary color)
5. Click "Язык" in the nav; verify smooth scroll to that section and nav updates to highlight it
6. Click "Пользователи" in the nav; verify smooth scroll and nav highlight

**Expected Result:**
- Page renders without errors
- Loading state briefly visible
- Sticky nav is responsive and scroll-spy correctly highlights sections
- Smooth scrolling works

**Designed Gap:**
- On mobile (`xs`), the left nav is hidden (`display: none`); scroll-spy still fires but nav is not visible

---

### SETTINGS-02: Organization — View Initial State

**Title:** Organization section displays persisted values

**Preconditions:**
- Page is loaded
- Mocked organization: name="Никитин Маркет", address="ул. Навои 42, Ташкент", phone="+998 90 123-45-67", email="info@nikitin-market.uz", logoUrl=null

**Steps:**
1. Scroll to Организация section
2. Verify the card header shows icon + "Организация" + subtitle "Данные компании в системе"
3. Verify the form fields are populated:
   - "Название компании" (required): "Никитин Маркет"
   - "Адрес" (optional): "ул. Навои 42, Ташкент"
   - "Телефон" (optional): "+998 90 123-45-67"
   - "Email" (optional): "info@nikitin-market.uz"
4. Verify the logo area shows a circular badge with initials "НМ" (from "Никитин Маркет")
5. Verify the buttons "Загрузить" and no "Убрать" (no logo set)
6. Verify the hint text "PNG или JPG, до 2 МБ" is visible

**Expected Result:**
- Form displays all persisted values
- Initials are correctly derived
- Logo area is empty (fallback to initials + primary color)

---

### SETTINGS-03: Organization — Edit & Mark Dirty

**Title:** Editing organization fields marks the form as dirty

**Preconditions:**
- Page is loaded in Settings
- Organization form is in initial state

**Steps:**
1. Change the "Название компании" field to "Новый Маркет"
2. Verify the Save bar at the bottom appears (if not already visible) with status "Есть несохранённые изменения" (dirty indicator)
3. Verify the status icon is an info icon (not a checkmark)
4. Verify both "Сохранить" and "Отменить" buttons are enabled
5. Change the "Адрес" field to "ул. Амира Темура 1"
6. Verify the dirty status persists

**Expected Result:**
- Form marks as dirty after first edit
- Save bar shows dirty state with info icon
- Buttons remain enabled (hard rule 5)

---

### SETTINGS-04: Organization — Reset Changes

**Title:** Отменить button discards unsaved changes

**Preconditions:**
- Organization form is dirty with edits: name="Новый Маркет", address="ул. Амира Темура 1"

**Steps:**
1. Click the "Отменить" button at the bottom
2. Verify the form fields revert to the original persisted values: name="Никитин Маркет", address="ул. Навои 42, Ташкент"
3. Verify the Save bar status updates to "Все изменения сохранены" (clean indicator)
4. Verify the status icon is now a checkmark (success color)

**Expected Result:**
- Reset discards all unsaved changes
- Form reverts to server state
- Save bar reflects clean status

---

### SETTINGS-05: Organization — Save Valid Changes

**Title:** Сохранить persists organization changes

**Preconditions:**
- Organization form is dirty
- User has edited: name="ООО Маркет", address="ул. Бухари 5", phone="+998 91 555-55-55", email="contact@market.uz"

**Steps:**
1. Click the "Сохранить" button
2. Verify the button becomes disabled (momentarily loading)
3. Verify a request is sent to `PUT /api/settings/organization` with the edited fields
4. Wait for the response (mock delays 300ms)
5. Verify the form remains populated with the new values
6. Verify the Save bar updates to "Все изменения сохранены" (clean state)
7. Verify a success toast "Настройки сохранены" appears

**Expected Result:**
- Organization is updated on the backend
- Form reflects the saved state
- Save bar clears the dirty indicator
- Success notification is shown

---

### SETTINGS-06: Organization — Logo Upload & Preview

**Title:** Upload PNG/JPG logo and preview data URL

**Preconditions:**
- Organization section is visible with no logo (initials "НМ" in badge)

**Steps:**
1. Click the "Загрузить" button
2. A file input opens (type="file", accept="image/png,image/jpeg")
3. Select a PNG or JPG file from the local filesystem (e.g., a 512×512 logo.png)
4. Verify the file is read as a data URL
5. Verify the logo badge immediately shows the uploaded image (backgroundImage with data URL)
6. Verify the initials are no longer visible (replaced by the image)
7. Verify a new "Убрать" button appears next to "Загрузить"

**Expected Result:**
- File upload is accepted (PNG/JPG only)
- Preview renders immediately as a data URL
- Logo badge displays the image
- Remove button becomes available

**Designed Gap:**
- The file size limit (2 MB) is enforced by the backend on save, not by the client on upload. Uploading a 5 MB file will preview but fail on save.

---

### SETTINGS-07: Organization — Remove Logo

**Title:** Убрать button clears uploaded logo

**Preconditions:**
- Logo has been uploaded and preview is visible

**Steps:**
1. Click the "Убрать" button
2. Verify the logo badge reverts to showing initials "НМ" + primary background
3. Verify the "Убрать" button disappears
4. Verify the form is marked dirty (if a logo was uploaded)
5. Click "Сохранить" to persist the removal

**Expected Result:**
- Logo is removed from preview
- Form reverts to initials fallback
- Change is persisted on save

---

### SETTINGS-08: Organization — Logo Save (Multipart)

**Title:** Multipart form-data upload includes logo file

**Preconditions:**
- Logo has been uploaded and preview is showing
- Form is dirty

**Steps:**
1. Click "Сохранить"
2. Intercept the request (network tab or mock logs)
3. Verify the request is `PUT /api/settings/organization`
4. Verify the `Content-Type` is `multipart/form-data`
5. Verify the form data includes:
   - `name`, `address`, `phone`, `email` text fields
   - `logoUrl` field (data URL from preview)
   - `logo` file part (the uploaded binary)
6. Wait for the response
7. Verify the response includes the updated organization with a new `logoUrl` (or the previewed one, in the mock)

**Expected Result:**
- Logo file is sent as multipart form data
- All organization fields are included in the same request
- Response confirms the update

---

### SETTINGS-09: Organization — Required Field (Name) Validation

**Title:** Name field is required; empty name is not allowed

**Preconditions:**
- Organization form is displayed

**Steps:**
1. Clear the "Название компании" field (make it empty or whitespace-only)
2. Try to click "Сохранить"
3. Observe the response from the backend (mock or real)

**Expected Result:**
- The backend returns a 400 validation error or the mock rejects
- A validation error toast appears (or inline field error, if client validation is added later)
- The save fails and the form remains dirty

**Designed Gap:**
- Client-side validation for required fields is not yet implemented; all validation is backend-on-submit (hard rule 5 — buttons never disabled for validation)

---

### SETTINGS-10: Language — View Language Options

**Title:** Language section displays radio-card options

**Preconditions:**
- Page is loaded
- Current user language in i18n is "ru"

**Steps:**
1. Scroll to Язык section
2. Verify the card header shows icon + "Язык" + subtitle "Язык интерфейса для вашего аккаунта"
3. Verify two radio-card options are displayed:
   - "Русский" (native label) with description "Интерфейс на русском языке", currently selected (checked, primary border + background)
   - "O'zbekcha" (native label) with description "Интерфейс на узбекском (латиница)", not selected
4. Verify a note box below: "Язык также можно сменить по иконке глобуса в шапке — это та же настройка. Действует только для вашего аккаунта и не влияет на других пользователей; данные (товары, партнёры) не переводятся."

**Expected Result:**
- Language options are clearly displayed
- Current selection is highlighted
- Note explains the feature scope

---

### SETTINGS-11: Language — Switch to Uzbek

**Title:** Language switch applies immediately via i18n

**Preconditions:**
- Language section is visible with "Русский" selected
- Current UI is in Russian

**Steps:**
1. Click the "O'zbekcha" radio card
2. Verify the card gets selected (primary border + background, checkmark icons appear)
3. Verify the API call `PUT /api/settings/language` is sent with `{ language: "uz-Latn" }`
4. Wait for the response (mock delays 150ms)
5. Verify the entire page UI switches to Uzbek immediately (i18n change)
6. Verify page labels, button text, section titles, etc. are now in Uzbek (e.g., "Тилл", "Узбекча")
7. Verify the topbar globe also reflects the language change

**Expected Result:**
- Language switches immediately without a page reload
- i18n applies to all visible text
- Backend is notified for persistence
- Topbar and all modules reflect the change

**Designed Gap:**
- uz-Cyrl is not yet listed in UI_LANGUAGES (incomplete translations); only uz-Latn is available

---

### SETTINGS-12: Language — Revert to Russian

**Title:** Switch back to Russian language

**Preconditions:**
- Language is currently set to "O'zbekcha"
- UI is displaying in Uzbek

**Steps:**
1. Click the "Русский" radio card
2. Verify the card gets selected
3. Verify the API call `PUT /api/settings/language` is sent with `{ language: "ru" }`
4. Verify the entire page UI switches back to Russian

**Expected Result:**
- Language switch is reversible
- UI updates to Russian

---

### SETTINGS-13: Currency — View Read-Only Section

**Title:** Currency section is read-only informational

**Preconditions:**
- Page is loaded

**Steps:**
1. Scroll to Валюта section
2. Verify the card header shows icon + "Валюта" + subtitle "Валюта учёта во всей системе"
3. Verify a read-only box displays: "Узбекский сум — UZS (сўм)" with an info icon
4. Verify a secondary info box below states: "Валюта: UZS (сўм). Мультивалютность будет доступна в будущих версиях."
5. Verify no editable controls are present

**Expected Result:**
- Currency section is informational only
- No user input is possible
- UZS lock message is clear

---

### SETTINGS-14: Users — View User List

**Title:** Users section displays active and deactivated users

**Preconditions:**
- Page is loaded
- Mock data: 4 users (3 active, 1 deactivated)

**Steps:**
1. Scroll to Пользователи section
2. Verify the card header shows:
   - Icon + "Пользователи"
   - Subtitle: "3 с доступом к системе · 1 деактивирована" (active count and deactivated count)
   - Action button "Пригласить пользователя" (top-right, enabled)
3. Verify the user list displays rows for each user:
   - Avatar (first letter of name, primary color, grayscale if deactivated)
   - Name (e.g., "Бахром Саидов"), small "(вы)" badge for self
   - Contact (e.g., "bakhrom@nikitin.uz" or phone)
   - "Администратор" chip (primary tone, muted if deactivated)
   - For deactivated users: "Деактивирован" chip (neutral tone, muted)
   - Last active time or status:
     - Self: "Активен сейчас" (green, bold)
     - Others active: last seen time (e.g., "10 дек, 14:30") or "Приглашён" if never logged in
     - Deactivated: "Деактивирован с 10 дек, 14:30"
   - Action button (icon only, tooltip on hover):
     - Active user: eye-off icon (deactivate), hover background error tone
     - Deactivated user: restore icon, hover background primary tone
4. Verify a footer note: "Роли пока не разделяются — у всех доступ администратора. Пользователи не удаляются — история операций ссылается на них."

**Expected Result:**
- User list renders correctly
- Counts are accurate
- Self is marked with "(вы)" badge
- Deactivated users are visually distinguished (grayscale, muted chips)
- Status/last-active info is displayed

---

### SETTINGS-15: Users — Deactivate Another User

**Title:** Deactivate a user with confirmation dialog

**Preconditions:**
- Users section is visible
- "Дилноза Каримова" (active, id=2) is in the list

**Steps:**
1. Hover over "Дилноза Каримова" row
2. Verify the action button (eye-off icon) is visible with tooltip "Деактивировать"
3. Click the deactivate button
4. Verify a confirm dialog appears:
   - Icon: eye-off (warning tone)
   - Title: "Деактивировать пользователя?"
   - Body: "«Дилноза Каримова» потеряет доступ к системе. История операций сохранится. Пользователя можно реактивировать в любой момент."
   - Buttons: "Отмена" (ghost) + "Деактивировать" (danger variant, red)
5. Click "Деактивировать"
6. Verify the API call `POST /api/settings/users/2/deactivate` is sent
7. Wait for the response (mock delays 250ms)
8. Verify the user row is updated:
   - Avatar is grayscaled
   - Name color becomes disabled (gray)
   - "Администратор" chip is muted
   - "Деактивирован" chip appears
   - Last-active time updates to deactivation date
   - Action button changes to restore icon
9. Verify a success toast "Пользователь Дилноза Каримова деактивирован" appears

**Expected Result:**
- Deactivation is confirmed
- Backend is updated
- User row reflects the deactivated state
- Toast confirms the action

---

### SETTINGS-16: Users — Cannot Deactivate Self

**Title:** Self-account deactivation is guarded with a toast

**Preconditions:**
- Users section is visible
- "Бахром Саидов" (self, marked with "(вы)") is in the list

**Steps:**
1. Hover over the self row
2. Verify the action button (eye-off icon) is still visible
3. Click the deactivate button
4. Verify a toast (info/warning) appears: "Нельзя деактивировать свою учётную запись"
5. Verify the user is NOT deactivated and remains unchanged

**Expected Result:**
- Self-deactivation is prevented with a user-friendly message
- No API call is sent
- No dialog appears

---

### SETTINGS-17: Users — Reactivate a User

**Title:** Reactivate a deactivated user

**Preconditions:**
- "Жасур Тураев" (deactivated, id=4) is visible in the users list

**Steps:**
1. Hover over "Жасур Тураев" row (deactivated, grayscaled)
2. Verify the action button is a restore icon (primary tone on hover)
3. Verify the tooltip says "Реактивировать"
4. Click the restore button
5. Verify the API call `POST /api/settings/users/4/reactivate` is sent
6. Wait for the response (mock delays 250ms)
7. Verify the user row is updated:
   - Avatar is no longer grayscaled
   - Name color returns to primary (bold)
   - "Администратор" chip is no longer muted
   - "Деактивирован" chip disappears
   - Last-active time (from when deactivated) remains visible but is not the current time (it was deactivation date)
   - Action button changes back to eye-off (deactivate)
8. Verify a success toast "Пользователь Жасур Тураев снова активен" appears

**Expected Result:**
- Reactivation succeeds
- User row reflects the active state
- Toast confirms the action

---

### SETTINGS-18: Users — Invite User Modal Opens

**Title:** Invite modal displays on "Пригласить пользователя" click

**Preconditions:**
- Users section is visible
- Modal is not already open

**Steps:**
1. Click the "Пригласить пользователя" button (top-right of the card)
2. Verify a dialog appears with:
   - Header: "Пригласить пользователя" (title) + "Доступ к системе по приглашению" (subtitle) + close icon
   - Body contains two fields:
     - "Телефон" (required, marked with *): empty text field with placeholder "+998 90 123 45 67" and inputMode="tel"
     - "Роль" (label, not editable): locked display "Администратор" (icon + text + info icon with "роли появятся позже")
   - Footer: "Отмена" (ghost, enabled) + "Отправить приглашение" (primary, enabled)

**Expected Result:**
- Modal opens with all fields visible
- Phone field is autofocused
- Role is locked and informational

---

### SETTINGS-19: Users — Invite with Invalid Phone

**Title:** Phone validation on invite form

**Preconditions:**
- Invite modal is open
- Phone field is focused

**Steps:**
1. Type "abc" into the phone field
2. Click "Отправить приглашение"
3. Verify the field shows an error state (red border / background)
4. Verify error text appears below: "Введите корректный номер телефона"
5. Verify the form does NOT submit
6. Verify the button remains enabled (hard rule 5)

**Expected Result:**
- Inline validation shows error on submit attempt
- Form is not sent
- User can correct and retry

---

### SETTINGS-20: Users — Invite with Valid Phone

**Title:** Successful invite with valid phone number

**Preconditions:**
- Invite modal is open
- Phone field is empty

**Steps:**
1. Type "+998 91 555 55 55" into the phone field
2. Verify the field is valid (no error)
3. Click "Отправить приглашение"
4. Verify the API call `POST /api/settings/users/invite` is sent with body: `{ method: "phone", value: "+998 91 555 55 55" }`
5. Wait for the response (mock delays 300ms)
6. Verify the modal closes
7. Verify a success toast "Приглашение отправлено" appears
8. Verify the new user appears in the list with:
   - Name derived from the phone (mock creates a display name)
   - Status "Приглашён" (if never logged in)
   - Active state (active=true)
   - Restore button (not visible until deactivated)
9. Verify the subtitle count updates: e.g., "4 с доступом к системе"

**Expected Result:**
- Invite succeeds
- New user is added to the list
- Modal closes
- Success toast appears

---

### SETTINGS-21: Users — Invite Modal Close

**Title:** Closing the invite modal discards input

**Preconditions:**
- Invite modal is open
- Phone field has "998901234567" entered

**Steps:**
1. Click the close icon (X) in the modal header
2. Verify the modal closes
3. Reopen the invite modal (click "Пригласить пользователя" again)
4. Verify the phone field is empty (input was discarded)

**Expected Result:**
- Modal state is cleared on close
- No data is persisted

---

### SETTINGS-22: Organization + Save Bar — No Empty Name

**Title:** Empty organization name rejection (backend validation)

**Preconditions:**
- Organization form is displayed with a valid name

**Steps:**
1. Clear the "Название компании" field (set to "")
2. Click "Сохранить"
3. Observe the backend behavior (mock or real)

**Expected Result:**
- Backend returns 400 error or rejects the request
- An error toast appears: "Не удалось сохранить настройки"
- Form remains dirty with the empty name value (client does not enforce)

---

### SETTINGS-23: Full Page Load Error Handling

**Title:** Error loading organization or users displays error notification

**Preconditions:**
- Page is navigated to
- Mock is set to return an error for organization OR users (simulated)

**Steps:**
1. (Simulate backend error by modifying mock or network condition)
2. Navigate to `/settings`
3. Observe the page attempts to load (loading spinner)
4. Verify an error toast appears: "Не удалось загрузить настройки"
5. Verify the page displays a fallback state (empty or shows the error)

**Expected Result:**
- Error is caught and displayed
- User is informed of the failure

**Designed Gap:**
- Retry logic is not implemented; user must reload the page

---

### SETTINGS-24: Dirty State Persistence on Navigation

**Title:** Unsaved changes are not lost if navigating away

**Preconditions:**
- Organization form is dirty (e.g., name changed to "Test")
- No save has been clicked

**Steps:**
1. Attempt to navigate away (e.g., click a sidebar link or back button)
2. Verify no unsaved-changes guard is triggered (guard not yet implemented, per mvp-plan)

**Expected Result:**
- Navigation proceeds (no guard)
- Unsaved changes are lost (form state is not persisted across routes)

**Designed Gap:**
- Unsaved-changes dialog is not yet implemented; this is a known gap (not a bug)

---

### SETTINGS-25: Save Bar Always Visible & Enabled

**Title:** Save bar buttons remain enabled (hard rule 5)

**Preconditions:**
- Organization form is dirty

**Steps:**
1. Verify "Сохранить" button is enabled (not grayed out)
2. Verify "Отменить" button is enabled
3. Make the form clean by clicking "Отменить"
4. Verify buttons remain enabled (not disabled)

**Expected Result:**
- Buttons never disable for validation or state
- They may disable only during the save operation (loading state)

---

### SETTINGS-26: Scroll-Spy Navigation (Desktop Only)

**Title:** Scroll-spy highlights active section in sticky nav

**Preconditions:**
- Page width is ≥768px (desktop)
- All sections are visible on the page

**Steps:**
1. Verify the left nav is visible (not hidden on mobile)
2. Manually scroll to the Валюта section
3. Verify the nav link "Валюта" becomes highlighted (primary color + primary-soft background)
4. Scroll further to Пользователи
5. Verify the nav link updates to highlight "Пользователи"
6. Scroll back up to Организация
7. Verify the nav link updates to highlight "Организация"

**Expected Result:**
- Scroll-spy correctly tracks the topmost section
- Nav highlight updates as user scrolls
- Nav is sticky (always visible at top of content area)

**Designed Gap:**
- On mobile (xs), nav is hidden; scroll-spy still fires but nav is not visible

---

### SETTINGS-27: Language Section Does Not Trigger Save Bar

**Title:** Language changes are independent of organization save bar

**Preconditions:**
- Organization form is clean
- Language is set to "Русский"

**Steps:**
1. Change language to "O'zbekcha"
2. Verify the save bar does NOT become dirty
3. Verify the save bar still shows "Все изменения сохранены" (clean state, not organization dirty)
4. Change organization name to "Test"
5. Verify the save bar now shows dirty (organization dirty)
6. Click "Отменить" to reset organization
7. Verify the save bar shows clean again
8. Verify the language remains set to "O'zbekcha" (language change was independent)

**Expected Result:**
- Language changes do not affect organization save bar
- Language is persisted independently
- Organization save bar only governs organization fields

---

### SETTINGS-28: Users Section Does Not Trigger Save Bar

**Title:** User invite/deactivate/reactivate are independent of organization save bar

**Preconditions:**
- Organization form is clean
- Users section is visible

**Steps:**
1. Invite a new user (click button, enter phone, send)
2. Verify the save bar remains clean ("Все изменения сохранены")
3. Deactivate a user
4. Verify the save bar remains clean
5. Reactivate the user
6. Verify the save bar remains clean
7. Edit organization name to "Modified"
8. Verify the save bar now shows dirty (organization only)

**Expected Result:**
- User actions apply immediately without affecting save bar
- Save bar governs organization changes only

---

### SETTINGS-29: Logo Data URL Persistence in Draft

**Title:** Logo data URL is held in the draft until save or reset

**Preconditions:**
- Organization section is displayed

**Steps:**
1. Upload a logo (file input → select PNG)
2. Verify the logo preview renders immediately (data URL in logoUrl field)
3. Change the organization name (trigger dirty)
4. Verify the logo preview persists in the draft
5. Click "Отменить" to reset
6. Verify the logo preview is removed (reverts to initials), confirming the logo upload was part of the unsaved draft

**Expected Result:**
- Logo is held in the draft until saved
- Resetting discards the logo upload as well

---

### SETTINGS-30: Empty Organization State (First Tenant)

**Title:** Empty organization is handled on first load

**Preconditions:**
- A fresh tenant with no organization profile is created (simulated)

**Steps:**
1. Navigate to `/settings`
2. Observe the organization section loads
3. Verify all fields are empty or have default values
4. Create an organization by filling in the fields and clicking "Сохранить"

**Expected Result:**
- Empty state is handled gracefully
- User can create the initial organization

**Designed Gap:**
- Mock always seeds initial organization data; true empty-state behavior depends on backend

---

### SETTINGS-31: Multiple Users in List (Pagination/Scroll)

**Title:** User list handles multiple users gracefully

**Preconditions:**
- Tenant has 10+ users

**Steps:**
1. Scroll through the users list
2. Verify all users are visible (no pagination in current design)
3. Verify rows are separated by dividers (except last row)

**Expected Result:**
- All users are rendered
- No pagination controls (per design)

**Designed Gap:**
- Pagination/limiting is not implemented; all users are shown

---

### SETTINGS-32: Logo Upload File Size Limit (Backend Validation)

**Title:** Logo exceeding 2 MB is rejected on save

**Preconditions:**
- A large image file (5 MB) is available
- Organization section is displayed

**Steps:**
1. Upload the 5 MB image
2. Verify the preview renders (client accepts any file)
3. Change organization name to mark the form dirty
4. Click "Сохранить"
5. Observe the backend response (mock or real)

**Expected Result:**
- Backend returns a 400 or 413 error
- An error toast appears: "Не удалось сохранить настройки"
- Save fails

**Designed Gap:**
- Client-side file-size validation is not implemented; validation is backend-only

---

### SETTINGS-33: Modal Dialog Accessibility (Invite)

**Title:** Invite modal is accessible and closes properly

**Preconditions:**
- Invite modal is open

**Steps:**
1. Press Escape key to close the modal
2. Verify the modal closes
3. Reopen the modal
4. Verify the phone field is autofocused (cursor in the field)
5. Verify the form can be submitted by pressing Enter (keyboard navigation)

**Expected Result:**
- Modal responds to Escape key
- Autofocus works
- Enter submits the form

---

### SETTINGS-34: Concurrent Saves (Race Condition)

**Title:** Rapid save clicks do not cause race conditions

**Preconditions:**
- Organization form is dirty

**Steps:**
1. Click "Сохранить"
2. Immediately click "Сохранить" again (before response arrives)
3. Verify the API call is made only once (or the second click is ignored due to button disable during loading)
4. Verify the form shows loading state (button disabled, spinning icon)

**Expected Result:**
- Only one save request is sent
- Form is not left in an inconsistent state

---

### SETTINGS-35: Language Switch Error Handling

**Title:** Language persistence error does not affect UI switch

**Preconditions:**
- Language section is visible set to "Русский"
- Mock is configured to fail language update

**Steps:**
1. Click the "O'zbekcha" radio card
2. Verify the UI switches to Uzbek immediately (i18n changes)
3. Observe the backend returns an error
4. Verify an error toast appears: "Не удалось сохранить язык"
5. Verify the UI remains in Uzbek (client change was not rolled back)

**Expected Result:**
- Language switch is optimistic (client changes first)
- Error toast informs user of persistence failure
- UI does not revert (known limitation — backend sync may not match UI)

**Designed Gap:**
- Optimistic update means the server state may diverge from client on error; no rollback occurs

---

### SETTINGS-36: Deactivate Confirm Dialog Cancel

**Title:** Cancelling deactivate dialog leaves user active

**Preconditions:**
- Deactivate confirm dialog is open for an active user

**Steps:**
1. Click "Отмена" button
2. Verify the dialog closes
3. Verify the user remains active (no API call was made)

**Expected Result:**
- Cancel discards the deactivation
- No state change occurs

---

### SETTINGS-37: Phone Validation Regex (9+ Digits)

**Title:** Phone validation checks for minimum 9 digits

**Preconditions:**
- Invite modal is open

**Steps:**
1. Type "+998 9" (7 digits total, 1 leading) into the phone field
2. Click "Отправить приглашение"
3. Verify the field shows error: "Введите корректный номер телефона"
4. Type "+998 90 123 45 67" (11 digits total, 9 national)
5. Click "Отправить приглашение"
6. Verify the form submits (no error)

**Expected Result:**
- Validation requires ≥9 digits (mock and form both check)
- Valid phone numbers proceed

---

### SETTINGS-38: Section Card Border & Layout

**Title:** Section cards render with consistent styling

**Preconditions:**
- Page is fully loaded

**Steps:**
1. Inspect the Организация section card
2. Verify it has a border (1px solid, divider color)
3. Verify border-radius is 12px
4. Verify the header has a tinted background or is separated (border-bottom)
5. Verify the icon is in a 30×30 rounded square with primary-soft background
6. Verify padding is consistent (16px header, 22px body)

**Expected Result:**
- Cards are styled per design system
- Borders, spacing, and icon styling are correct

---

### SETTINGS-39: Save Bar Position & Visibility

**Title:** Save bar is sticky at the bottom and always visible

**Preconditions:**
- Organization form is dirty
- Page is scrolled to the bottom

**Steps:**
1. Scroll to the top of the page (Организация section)
2. Verify the save bar is NOT visible at the top
3. Scroll down to the bottom (past Пользователи section)
4. Verify the save bar is visible at the bottom (within the content area, not floating)
5. Verify it does not overlap with the last section

**Expected Result:**
- Save bar is positioned at the bottom of the content
- It scrolls with the page (not a floating/sticky bar)

**Designed Gap:**
- Save bar is not sticky/floating; it's part of the normal flow

---

### SETTINGS-40: Responsive Layout (Mobile)

**Title:** Settings page layout on mobile devices

**Preconditions:**
- Viewport width is <768px (mobile breakpoint)

**Steps:**
1. Resize the browser to mobile width (e.g., 375px)
2. Verify the left sticky nav is hidden (`display: none`)
3. Verify the sections stack vertically
4. Verify the main content takes the full width
5. Verify all section cards remain readable and clickable

**Expected Result:**
- Mobile layout is responsive
- Nav is hidden, content is centered
- Cards remain accessible

---

## Cross-Module Reconciliation Cases

### SETTINGS-REC-01: User Deactivation Audit Trail

**Title:** Deactivated user is still referenced in audit logs (immutable history rule)

**Preconditions:**
- User "Дилноза Каримова" is deactivated in Settings
- A previous transaction has been recorded with her as the author

**Steps:**
1. Navigate to any transaction that was created by the deactivated user
2. Verify the transaction's audit log / author field still displays the user's name
3. Return to Settings
4. Verify the user remains in the list (not deleted), marked deactivated

**Expected Result:**
- Deactivation does not remove history references (rule 41)
- Audit trail remains intact

**Reconciliation:** Audit immutability is preserved; deactivation is status-only.

---

### SETTINGS-REC-02: Language Setting Affects UI Across Modules

**Title:** Language change in Settings applies to all modules immediately

**Preconditions:**
- Settings page is open, language is "Русский"
- Other modules (e.g., Products, Partners) are accessible

**Steps:**
1. Switch language to "O'zbekcha" in Settings
2. Navigate to the Products module
3. Verify all labels, buttons, and field names are in Uzbek
4. Navigate back to Settings
5. Verify the language is still "O'zbekcha"

**Expected Result:**
- Language persists across navigation
- All modules reflect the selected language

**Reconciliation:** i18n state is global and shared; language change affects all consumers.

---

## Known Limitations & Design Gaps

1. **No unsaved-changes guard on navigation** — Navigating away from Settings with unsaved organization changes loses the draft (no dialog). This is by design (not a bug).

2. **Optimistic language update** — Language changes immediately in the UI before confirmation from the backend. If the backend fails, the UI remains switched (no rollback).

3. **uz-Cyrl not yet available** — Uzbek Cyrillic is not listed in UI_LANGUAGES until translations are complete.

4. **No client-side file-size validation for logos** — File size limit (2 MB) is enforced only on backend save, not on upload.

5. **No pagination for users list** — All users are rendered on a single view; no paging or infinite scroll.

6. **Logo removal does not clear backend** — Removing a logo clears the preview but requires a save; if reset is clicked before save, the upload is discarded but backend logo persists.

7. **Phone-only invites in v1** — Email invites are not supported (backend rejects with 400); only phone-based invites work.

8. **No role assignment** — All invited users are "Администратор"; role splitting is deferred to a future version.

9. **No concurrent session handling** — If the same organization is edited in multiple browser tabs/sessions, the last save wins (no conflict resolution).

10. **Scroll-spy offset** — Scroll-spy highlights the section whose top is within 90px of the viewport top; edge cases may cause nav to highlight the previous section momentarily.

---

## Test Execution Notes

- **Test Environment:** app.miraziz.net (frontend) with api.miraziz.net (real backend, mocks OFF for production)
- **Setup:** Tenant starts empty; the mock seeds initial organization + 4 users for testing
- **Cleanup:** After testing, clear the tenant state or use a fresh tenant for repeatable results
- **Browser Compatibility:** Chrome, Firefox, Safari, Edge (all modern versions)
- **Accessibility:** Test with screen readers and keyboard navigation (Tab, Enter, Escape)
