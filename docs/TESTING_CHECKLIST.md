# ✅ Testing Checklist - MatchFlow Sprint Validation

**Objective:** Ensure all features work as expected before merging to develop  
**Owner:** Dev 4 (QA Lead) + Dev 3 (Testing Support)  
**Tools:** Manual testing on localhost (json-server)

---

## 🚀 PRE-TESTING SETUP

### Start Backend
```bash
cd F2-MatchFlow
npm install  # If first time
npm start    # Starts json-server on port 3000
```

### Verify db.json is Present
```bash
# Make sure you have:
src/data/db.json
# With complete sample data: users, jobs, matches, reservations, messages
```

### Clear Browser Cache
```
Press F12 → Developer Tools → Application
→ Local Storage → Delete all
→ Refresh page
```

---

## 📋 SPRINT 1: CREATE MATCHES TESTING

### Test 1.1: Backend - createMatch()
- [ ] Open browser console (F12)
- [ ] Paste and run:
```javascript
// Test createMatch function
const response = await fetch('http://localhost:3000/matches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 6,
    jobId: 101,
    candidateId: 1,
    status: 'pending'
  })
});
const result = await response.json();
console.log('Match created:', result);
```
- [ ] Check response includes `id`, `status: pending`, correct companyId/jobId/candidateId
- [ ] No 400/500 errors

### Test 1.2: UI - Dashboard Modal
- [ ] Login as Company A (companyId: 6)
- [ ] Go to Dashboard
- [ ] Click `➕ Create New Match` button
- [ ] Modal opens with two dropdowns
- [ ] Dropdown 1 shows list of "Open to Work" candidates
- [ ] Dropdown 2 shows list of active jobs for Company A
- [ ] Select one candidate, one job
- [ ] Click "Create Match" button
- [ ] [ ] Success message appears: "Match created successfully"
- [ ] Modal closes automatically
- [ ] Match appears in matches list with `status: pending`

### Test 1.3: Fix hardcoded CompanyId
- [ ] Login as Company B (companyId: 7)
- [ ] Go to Jobs page
- [ ] [ ] See ONLY Company B's jobs (not Company A's)
- [ ] Go to Interviews page
- [ ] [ ] See ONLY Company B's interviews
- [ ] Login as Company A (companyId: 6)
- [ ] Go to Jobs page
- [ ] [ ] See ONLY Company A's jobs
- [ ] **Verify:** Each company sees their own data

### Test 1.X: Error Cases
- [ ] Try to create match with same candidate + job twice → Error: "Duplicate match"
- [ ] Try to create match with non-existent candidate → Error: "Candidate not found"
- [ ] Try to create match with non-existent job → Error: "Job not found"
- [ ] Network timeout (turn off API) → Error message visible

---

## 📋 SPRINT 2: MATCH STATES TESTING

### Test 2.1: State Machine Transitions
**Valid transitions:**
- [ ] pending → contacted ✅
- [ ] pending → discarded ✅
- [ ] contacted → interview ✅
- [ ] contacted → discarded ✅
- [ ] interview → hired ✅
- [ ] interview → discarded ✅
- [ ] hired → (no transitions) ✅
- [ ] discarded → (no transitions) ✅

**Invalid transitions (should error):**
- [ ] pending → interview ❌ Shows error
- [ ] pending → hired ❌ Shows error
- [ ] contacted → pending ❌ Shows error
- [ ] hired → contacted ❌ Shows error

### Test 2.2: DB States Updated
- [ ] Open `src/data/db.json`
- [ ] Check matches[]:
  - [ ] Mínimo 1 match con status: `pending`
  - [ ] Mínimo 1 match con status: `contacted`
  - [ ] Mínimo 1 match con status: `interview`
  - [ ] Mínimo 1 match con status: `hired`
  - [ ] Mínimo 1 match con status: `discarded`

### Test 2.3: UI State Change Buttons
- [ ] Go to Dashboard / Matches page
- [ ] For each match, see buttons based on status:
  - [ ] pending match: Shows `[Contact]` and `[Discard]` buttons
  - [ ] contacted match: Shows `[Interview]` and `[Discard]` buttons
  - [ ] interview match: Shows `[Hire]` and `[Discard]` buttons
  - [ ] hired match: Shows `[Hired ✓]` (disabled gray)
  - [ ] discarded match: Shows `[Discarded ✗]` (disabled gray)

### Test 2.X: Button Click Actions
- [ ] Click `[Contact]` on pending match
  - [ ] Confirmation dialog: "Change to contacted?"
  - [ ] Yes → Match updates to `status: contacted`
  - [ ] Buttons update to `[Interview]` and `[Discard]`
  - [ ] No → Nothing changes

- [ ] Click `[Interview]` on contacted match
  - [ ] Match updates to `status: interview`
  - [ ] Button updates to `[Hire]`

- [ ] Click `[Hire]` on interview match
  - [ ] Match updates to `status: hired`
  - [ ] Button shows `[Hired ✓]` disabled

### Test 2.X: Visual Feedback
- [ ] Colors/styling change for each state:
  - [ ] pending: Light gray background
  - [ ] contacted: Light yellow background
  - [ ] interview: Light blue background
  - [ ] hired: Light green background
  - [ ] discarded: Light red background
- [ ] Badge or label shows current state

---

## 📋 SPRINT 3: RESERVATIONS TESTING

### Test 3.1 Backend: Validation
```javascript
// Test conflict detection
const response = await fetch('http://localhost:3000/reservations?candidateId=1&isActive=true');
const reservations = await response.json();
console.log('Active reservations:', reservations);
```
- [ ] Returns only active reservations (isActive: true)
- [ ] Returns empty array if candidate not reserved
- [ ] Each reservation has: candidateId, jobId, companyId, isActive

### Test 3.2: Reserve Button Visibility
- [ ] Login as Company A
- [ ] Go to Candidates page
- [ ] See list of "Open to Work" candidates
- [ ] Each candidate card has `🔒 Reserve` button
- [ ] Click on one → Job selection modal opens
- [ ] Modal shows company A's jobs in dropdown
- [ ] Select a job → "Confirm Reserve" button enabled
- [ ] Click Confirm → Success message
- [ ] Modal closes
- [ ] Candidate now shows badge: `🔒 RESERVED` and `Reserved by: Company A`
- [ ] Button changes to `🔓 Release`

### Test 3.3: Conflict Detection
- [ ] Company A reserves Candidate #1 for Job #101
- [ ] Login as Company B
- [ ] Go to Candidates
- [ ] Find Candidate #1 → Badge shows `🔒 RESERVED`
- [ ] Try to reserve same candidate for Job #101
  - [ ] Error message: "Candidate already reserved for this job"
  - [ ] Modal closes without creating reservation
- [ ] Can still reserve same candidate for a DIFFERENT job
  - [ ] No error message
  - [ ] Creates new reservation successfully

### Test 3.4: Release Button
- [ ] Login as Company A
- [ ] Find "my" reserved candidate
- [ ] See badge: `📌 MY RESERVATION`
- [ ] See `🔓 Release` button (instead of Reserve)
- [ ] Click Release
  - [ ] Confirmation dialog: "Release this reservation?"
  - [ ] Yes → Reservation marked inactive (isActive: false)
  - [ ] Success message: "Reservation released"
- [ ] Candidate returns to normal state:
  - [ ] Badge disappears
  - [ ] Button changes back to `🔒 Reserve`

### Test 3.5: Visual Blocking States
- [ ] Normal candidate: White card
- [ ] Reserved (other company): Card with yellow border + badge
- [ ] My reservation: Card with blue border + "MY RESERVATION" badge
- [ ] After release: Back to white card

### Test 3.X: Edge Cases
- [ ] Reserve candidate with openToWork = false → Error
- [ ] Reserve non-existent candidate → Error
- [ ] Reserve for non-existent job → Error
- [ ] Two companies reserve same candidate simultaneously
  - [ ] First one succeeds
  - [ ] Second gets error: "Conflict detected"

### Test 3.X: Full User Flow
```
1. Login Company A → Dashboard
2. Search & find open Candidate
3. Click "Reserve"
4. Select Job from dropdown
5. Click "Confirm Reserve"
6. ✅ Success message
7. Modal closes
8. Candidate shows as reserved
9. Switch to Company B → Dashboard
10. Find same Candidate
11. See badge "RESERVED" + disabled button
12. Try to reserve same student
13. ❌ Error: "Already reserved"
14. Switch back to Company A
15. Click "Release"
16. ✅ Candidate now available
17. Switch to Company B
18. Can now reserve same candidate ✅
```

---

## 📋 SPRINT 4: CONTACT PRIVACY TESTING

### Test 4.1: Contact Info Hidden by Default
- [ ] Login as Company A
- [ ] Go to Candidates page
- [ ] Click on Candidate with no match
- [ ] Contact info (phone, email) NOT visible
- [ ] See message: "Contact info visible after match status reaches 'Contacted'"

### Test 4.2: Contact Info Visible When Contacted
- [ ] Find Candidate with match where status = "contacted"
- [ ] Click on candidate
- [ ] Contact info IS visible:
  - [ ] Phone number shown
  - [ ] Email shown
  - [ ] LinkedIn link shown

### Test 4.3: Contact Hidden if Match Not "Contacted"
- [ ] Find Candidate with match in states: pending, interview, hired, discarded
- [ ] Click on candidate
- [ ] Contact info still NOT visible
- [ ] Change match status → "contacted"
- [ ] Refresh page or see real-time update
- [ ] Contact info NOW visible

### Test 4.4: [OPTIONAL] WhatsApp Redirect
- [ ] If contact hidden, see WhatsApp button instead
- [ ] Click WhatsApp button
- [ ] Opens WhatsApp with pre-filled message:
  - [ ] Phone number correct
  - [ ] Message template filled: "Hi [candidate name]"

---

## 📋 SPRINT 5: ERROR HANDLING & EDGE CASES

### Test 5.1: Network Errors
- [ ] Stop json-server (CTRL+C)
- [ ] Try to create match → Error message appears
  - [ ] Not a blank page
  - [ ] Message says something like: "Connection failed"
- [ ] Start json-server again
- [ ] Retry → Works

### Test 5.2: Missing Data Errors
- [ ] POST match with missing `jobId` field → 400 error
- [ ] POST match with invalid `companyId` → 400 error
- [ ] GET non-existent match → 404 error
- [ ] User-friendly error message shown in UI

### Test 5.3: Timeout Errors
- [ ] Simulate slow API response (Network tab Throttle: Slow 3G)
- [ ] Try to reserve candidate
- [ ] Loading spinner shows while waiting
- [ ] After 10 seconds of no response → Timeout error
- [ ] Error message suggests retry

### Test 5.4: State Inconsistencies
- [ ] Create match while offline
- [ ] View shows optimistic update (match appears)
- [ ] Go online → Sync checks
- [ ] If server has different state → Warn user or refresh

### Test 5.5: Permission Checks
- [ ] Login as Candidate (role: candidate)
- [ ] Try to click "Reserve" button on candidates page
  - [ ] Button hidden or disabled
  - [ ] Cannot access company-only features
- [ ] Try to manually navigate to dashboard/matches
  - [ ] Redirected to candidate page or login
  - [ ] Proper permission error

### Test 5.6: Concurrent Actions
- [ ] Open two browser windows, Company A and Company B
- [ ] Company A reserves Candidate #1
- [ ] Company B (window 2) still shows Candidate #1 as available
- [ ] Company B clicks "Reserve"
  - [ ] Error: "Candidate already reserved"
  - [ ] Candidate B page refreshes to show the reservation

---

## 🎯 INTEGRATION TEST FULL WORKFLOW

### Super Flow: Complete Matching Lifecycle

```
SETUP:
- Clear browser local storage
- Start json-server
- Make sure db.json has complete test data

FLOW:
1. [LOGIN] Login Company A (id: 6 / email: company.a@)
   ✅ Dashboard loads with empty/few matches

2. [CREATE] Create first match for Candidate #1
   → Dashboard modal:
   ✅ Select: Candidate #1 "Alice Johnson", Job #101 "Senior Dev"
   → Click "Create Match"
   ✅ Match created with status: pending
   ✅ Match appears in matches list

3. [CHANGE STATE 1] Change state pending → contacted
   ✅ Click "Contact" button on the match
   ✅ Confirmation dialog
   ✅ Match updates to contacted
   ✅ Buttons change to "Interview" + "Discard"

4. [CHECK PRIVACY] Candidate sees contact info now
   → Switch to Candidate #1's page (login as candidate if needed)
   ✅ Contact info (phone/email) now visible

5. [CHANGE STATE 2] Change state contacted → interview
   ✅ Click "Interview" button
   ✅ Match updates to interview
   ✅ Button changes to "Hire"

6. [CREATE 2ND MATCH] Create match with different company
   → Login Company B (id: 7)
   → Candidates page
   ✅ See Candidate #2 available (not reserved)
   → Click "Reserve"
   → Select Job #102
   ✅ Reservation created
   ✅ Candidate #2 shows badge "RESERVED"

7. [CONFLICT TEST] Try to reserve same candidate
   → Still logged in Company B
   → Try to reserve Candidate #2 again for Job #103 (different job)
   ✅ Succeeds (no conflict, different job)
   → Try to reserve for Job #102 again
   ❌ Error: "Candidate already reserved for this job"

8. [RELEASE] Release the reservation
   → Click "🔓 Release" on Candidate #2
   ✅ Confirmation
   ✅ Reservation released
   ✅ Badge disappears
   ✅ Button changes back to "Reserve"

9. [FINAL CHECKS]
   → Matches between Company A and Candidate #1 still shows state:interview
   → Contact info still visible for Candidate #1
   → No console errors (F12)
   → All state changes persisted in db.json

RESULT: ✅ 100% FLOW COMPLETE - READY FOR PRODUCTION
```

---

## 📊 TESTING SUMMARY TEMPLATE

After each sprint, fill out:

```
SPRINT X: [Feature Name]
Date: ____
Tester: ____

PASS: ✅ / FAIL: ❌
  [ ] Backend functions work
  [ ] UI renders correctly
  [ ] Error handling in place
  [ ] No console errors
  [ ] State changes persist
  [ ] Conflicts detected
  [ ] Data validated

Issues Found:
1. [Issue]: ____
   Severity: Low / Medium / High / Critical
   Fix: ____

Sign-off: ____
```

---

## 🚨 CRITICAL CHECKLIST (Don't Merge Without These!)

Before merging any sprint to `refactor`:

- [ ] ✅ All tests in this section PASSED
- [ ] ✅ No console errors when running feature
- [ ] ✅ No broken styles or layout issues
- [ ] ✅ Error messages are user-friendly
- [ ] ✅ Code reviewed by Dev 4
- [ ] ✅ db.json has complete test data
- [ ] ✅ Feature doesn't break other features
- [ ] ✅ Mobile view tested (if applicable)

---

## 📞 When Tests Fail

1. Document the issue clearly:
   - What you did (steps)
   - What you expected
   - What actually happened
   - Screenshot/console error

2. Post in #bugs Discord channel:
   ```
   ❌ Sprint X Feature: Error
   Steps: 1, 2, 3...
   Expected: ____
   Actual: [screenshot]
   Console error: [paste error]
   ```

3. Assign to relevant developer:
   - Backend issue → Dev 1
   - Frontend issue → Dev 2
   - UI/styling issue → Dev 3

4. Wait for fix, then re-test

---

**Document Status:** Ready for Use  
**Last Updated:** 2026-02-05  
**Owner:** Dev 4 (QA Lead)
