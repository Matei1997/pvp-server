# Loadout Attachments UI (Pass 64)

## Overview

Expose the existing weapon attachment system properly in the Loadout UI. No new backend; reuse existing data and events.

---

## 1. What Already Existed

### Backend
- **WeaponAttachments.data.ts:** `WEAPON_ATTACHMENTS` — weapon hash, weaponName, displayName, components (hash, name, category, recoilModifier)
- **Categories:** clip, grip, muzzle, scope, barrel, flashlight, skin
- **WeaponPresets.service:** `loadPlayerPresets`, `savePlayerPreset`, `applyWeaponPresets`
- **CEF events:** `loadout:getPresets`, `loadout:savePreset`, `loadout:presetsLoaded`
- **WeaponPresetEntity:** characterId, weaponName, components (number[])

### Frontend (before Pass 64)
- **LoadoutPanel:** WEAPONS array (mirrors backend), weapon list by category, preview, attachments section
- **Events:** presetsLoaded, getPresets, savePreset
- **Slots:** Shown per weapon; toggle to add/remove; save sends components array

---

## 2. What Was Missing in the UI

- Human-readable slot labels (e.g. "Optic" instead of "scope", "Magazine" instead of "clip")
- Explicit "None" option per slot to clear selection
- Clear weapon details panel when a weapon is selected
- Consistent slot display order
- Weapon sidebar section title

---

## 3. Slots Supported

| Backend category | Display label |
|------------------|---------------|
| clip | Magazine |
| scope | Optic |
| muzzle | Muzzle |
| grip | Grip |
| barrel | Barrel |
| flashlight | Flashlight |
| skin | Skin |

**Stock:** Not supported in backend; not shown.

---

## 4. Changes Made

### LoadoutPanel.tsx
- Added `SLOT_ORDER` and `SLOT_LABELS` for display
- Replaced `toggleComponent` with `setComponent(category, hash | null)` — supports explicit None
- Added "None" button per slot
- Reorganized layout: weapon grid left, weapon details panel center (preview + attachment slots), stats + save right
- Added `weaponSidebarTitle`, `weaponDetailsPanel`, `weaponDetailsHeader`

### loadout.module.scss
- `.weaponSidebarTitle`
- `.weaponDetailsPanel`, `.weaponDetailsHeader`
- `.attachmentsRight` for stats + save column
- Adjusted `.attachments` for center panel

---

## 5. Limitations / Unsupported Cases

- **Rarity/class:** Not in backend; not shown
- **Stock slot:** Not in backend; not shown
- **Weapon data:** Frontend WEAPONS mirrors backend; no API to fetch. Minor drift possible (e.g. Pump Shotgun Default Clip hash 0 in backend, not in frontend)
- **Empty slots:** Slots with no options for a weapon are not rendered (filtered out)
