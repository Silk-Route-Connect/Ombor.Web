# Design tokens — Ombor

**Status:** token sheet — theme.ts mirrors this in code; DSN-1 foundational sheet + Design-project tokens.css are the design-side authority (ui-patterns.md "Styling authority").
**Last updated:** 2026-07-14

primary (Bukhara Teal): #12676B
primary hover / dark variant: #0F575B (hover) · #0C474A (press)
accent (saffron): #B8860B
semantic success: #2E7D5B
semantic error: #BE3A2B
semantic warning: #C77E15
semantic info: #12676B
page background: #F4F1EA
surface / card background: #FFFFFF
divider / border: #E4DFD5 (default border) · #D4CDBF (strong) · #ECE8DF (divider inside panes/menus)
text primary: #1C2625
text secondary: #565F5E
border radius scale (every value used, smallest to largest, with what it's used on): 6px (sm) · 8px (md — inputs, buttons, menus, nav items) · 12px (lg) · 16px (xl — cards, tables) · 999px (pill — chips, outlined auth buttons)
spacing scale (if defined): 8px base grid — 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px (--sp-1…--sp-8)
font, UI text: Onest (variable, weights 400/500/600/700; 800 reserved for display numbers + wordmark), fallback -apple-system / Segoe UI / system-ui
font, numeric / tabular: Onest with tabular lining figures ("tnum" 1, "lnum" 1 / font-variant-numeric: tabular-nums lining-nums) for tables, money, KPIs; display numbers use proportional lining ("pnum" 1, "lnum" 1)

other color tokens:
primary light (tinted fills, selected nav): #CBE2E2 (--teal-100)
primary contrast: #FFFFFF
accent hover: #976D08
accent light: #FAF2DC
accent contrast: #2A1B05
teal scale: 50 #E8F1F1 · 100 #CBE2E2 · 200 #9BC6C8 · 300 #6AA9AC · 400 #3C8B8F · 500 #12676B · 600 #0F575B · 700 #0C474A · 800 #093639 · 900 #06292B
amber (saffron) scale: 50 #FAF2DC · 100 #F1DFAE · 200 #E4C673 · 300 #CFA53A · 400 #B8860B · 500 #976D08 · 600 #745305
stone (warm neutral) scale: 0 #FFFFFF · 50 #FAF8F4 · 100 #F4F1EA · 200 #E9E4DA · 300 #DAD3C6 · 400 #B8AF9F · 500 #8C8576 · 600 #5E5849 · 700 #3D3A30 · 800 #272620 · 900 #1A1A16
text tertiary / placeholder: #87908E
text on teal: #FFFFFF · dimmed rgba(255,255,255,0.82)
bg subtle (table stripe, subtle fill): #FAF8F4
bg sunken: #EFEBE2
success bg: #E3F0E9 · success fg: #1C5C40
danger bg: #FAE8E5 · danger fg: #8F2A1F
warning bg: #FBF1DF · warning fg: #8A5A0E
info bg: #E8F1F1 · info fg: #0C474A
income: #2E7D5B (= success) · expense: #BE3A2B (= danger)
disabled text on light: #B8AF9F (--stone-400)

other shape / misc tokens:
shadow-xs: 0 1px 2px rgba(28,38,37,0.05)
shadow-sm: 0 1px 3px rgba(28,38,37,0.08), 0 1px 2px rgba(28,38,37,0.05)
shadow-md: 0 4px 12px rgba(28,38,37,0.09), 0 2px 4px rgba(28,38,37,0.05)
shadow-lg: 0 12px 28px rgba(28,38,37,0.13), 0 4px 8px rgba(28,38,37,0.06)
type scale: display 40/44 −0.02em · h1 32/38 −0.018em · h2 26/32 −0.014em · h3 21/28 −0.01em · h4 18/26 −0.006em · body-lg 16/24 · body 14/20 · sm 13/18 · caption 12/16 · overline 11/14 +0.08em uppercase
motion: ease-standard cubic-bezier(0.4, 0, 0.2, 1) · ease-out cubic-bezier(0.0, 0, 0.2, 1) · dur-fast 150ms · dur-standard 300ms
layout: sidebar 248px expanded / 72px collapsed · topbar 64px
