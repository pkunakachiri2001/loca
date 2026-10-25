# FAMBA VEHICLE VALUATION PLATFORM
## Technical Standards Verification & Global / Regional Methodology Compliance

**Document Version:** 1.0  
**Framework:** Zimbabwe Multi-Factor Defensible Valuation Framework (ZMDVF-v1)  
**Author:** KUNAKA TECH  
**Currency:** United States Dollars ($ USD)  
**Target Audience:** Executive Management, Board of Directors, Commercial Banks, Insurance Underwriters (Zimnat), Corporate Fleet Managers, and Automotive Dealerships  

---

## 1. Executive Statement of Compliance

The valuation formula implemented within the **Famba Automotive Platform** is strictly compliant with internationally recognized valuation protocols established by the **International Valuation Standards Council (IVSC)** and mirrors the structural mathematics of the **TransUnion Auto Dealer Guide** (the prevailing SADC standard).

Rather than relying on informal classifieds, social media ads with speculative markups, or raw foreign books that fail to reflect Zimbabwean import realities, Famba's **ZMDVF-v1** framework combines the **Depreciated Replacement Cost (DRC)** method with the **Market Sales Comparison Approach**, calibrated specifically for Zimbabwe's landed import tariffs and USD cash economy.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTERNATIONAL & REGIONAL ACCORD                        │
│                                                                             │
│  • Global Standard:   IVSC (IVS 200 - Plant, Machinery & Vehicles)          │
│  • Regional SADC:     TransUnion Auto Dealer Guide (Mead & McGrouther)      │
│  • Commonwealth/UK:   CAP HPI & Glass's Guide                               │
│  • North American:    Kelley Blue Book (KBB) & Edmunds                      │
│                                                                             │
│  STATUS: FULLY ALIGNED WITH ZIMBABWE-SPECIFIC ECONOMIC CALIBRATION          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Global Valuation Standards Alignment: IVSC (IVS 200)

Under **IVS 200** (*Plant and Equipment / Motor Vehicles*) codified by the **International Valuation Standards Council**, there are two primary recognized valuation methodologies for movable motor assets:

### A. The Depreciated Replacement Cost (DRC) Approach
* **Definition:** Calculates the current cost of replacing an asset with its modern equivalent, less deductions for physical deterioration and all relevant forms of obsolescence.
* **Famba Implementation:** 
  The engine begins with the **Landed Port Cleared Replacement Baseline** ($C_{\text{landed}}$) for each specific make, model, and variant, accounting for ZIMRA customs tariffs, and applies an actuarial depreciation decay curve based on age.

### B. The Market Sales Comparison Approach
* **Definition:** Compares the subject asset with identical or similar assets for which reliable market price information is available, making adjustments for differences in age, mileage, condition, and optional equipment.
* **Famba Implementation:**
  The engine benchmarks against active inventory from major dealership strips (Harare Msasa, Borrowdale, Samora Machel, Bulawayo Belmont) and anonymized insurance claims settlements (e.g. Zimnat audits) to establish real-world price boundaries.

---

## 3. Side-by-Side Comparison: Regional & Global Standards

The table below demonstrates how Famba's **ZMDVF-v1** matches every single parameter used by regional (SADC) and global automotive valuation bodies:

| Valuation Parameter | TransUnion (SADC Standard) | Kelley Blue Book (US Standard) | CAP HPI (UK/Commonwealth) | Famba ZMDVF-v1 (Zimbabwe Engine) | Compliant? |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **1. Starting Baseline** | Original MSRP / Landed List Price | Manufacturer Base Invoice | Modern Equivalent New Price | **Landed CIF Port Replacement Cost in USD** | **YES** |
| **2. Age Depreciation** | Annual Actuarial Matrix | Time-decay residual curve | Monthly residual depreciation | **Bracketed Age Depreciation Curve** ($0$–$2$y, $3$–$6$y, $7$–$10$y, $>10$y) | **YES** |
| **3. Mileage Adjustment** | $\pm$ Variance vs expected km (avg $15,000$ km/yr) | Mileage tier adjustment per 1,000 miles | Mileage scale adjustment vs fleet norm | **Calibrated variance vs Zim average ($14,000$ km/yr)** | **YES** |
| **4. Physical Condition** | Graded A (Clean), B (Average), C (Fair), D (Poor) | Excellent, Very Good, Good, Fair | Graded 1 to 5 Condition Matrix | **5-Tier Rating** (Excellent, Good, Fair, Poor, Accident-Damaged) | **YES** |
| **5. Accident History** | Major accident record write-down | Insurance salvage / frame damage flag | Structural repair deduction | **Direct deductions for Minor ($-5\%$) & Major Repaired ($-16\%$)** | **YES** |
| **6. Value Outputs** | Trade-in (Low) vs Retail (High) | Trade-in, Private Party, Dealer Retail | Trade, Clean, Retail | **Indicative Fair Value, Low (Liquidation), High (Retail)** | **YES** |
| **7. Verification** | Static printed monthly book | Digital VIN lookup | Digital HPI check certificate | **Cryptographic QR Code** linking to live tamper-proof URL | **YES** |

---

## 4. Why Foreign Price Guides Cannot Be Used Directly in Zimbabwe

A common question from executive managers, auditors, and bank risk committees is:  
> *"Why can't we simply subscribe to the South African TransUnion Auto Guide or UK CAP HPI directly without adapting the formula?"*

Using foreign books without local calibration creates massive financial distortions due to five structural factors:

### 1. Landed Import Freight & ZIMRA Customs Duties
* South Africa manufactures passenger cars locally (Toyota in Prospecton/Durban, Volkswagen in Kariega, Ford in Silverton, BMW in Rosslyn) with **0% customs duties**.
* Over **85% of vehicles on Zimbabwean roads are imported** (via Durban or Beira from Japan, the UK, or South Africa).
* Importing into Zimbabwe incurs:
  - **40% – 60% ZIMRA Customs Duty**
  - **Surtax** (up to 35% on older passenger vehicles)
  - **15% Value Added Tax (VAT)**
* *Result:* A vehicle that costs $3,500 in Japan or R80,000 in South Africa requires between **$8,000 and $10,500 landed and cleared in Harare**. Applying a raw foreign book undervalues the local asset by 40% to 60%, resulting in severe under-insurance.

### 2. The "10-Year Age Surtax Cliff"
* In South Africa and Europe, older vehicles (10–15 years old) depreciate continuously toward near-zero scrap value due to roadworthiness regulations and emissions taxes.
* In Zimbabwe, ZIMRA imposes punitive surtaxes on importing vehicles older than 10 years.
* *Result:* Clean, roadworthy older vehicles already registered inside Zimbabwe hold a **strong price floor**. They do not depreciate to zero because replacing them with a newly imported equivalent is cost-prohibitive.

### 3. Currency Realities: USD Hard Currency vs Volatile ZAR
* TransUnion publishes in South African Rand (ZAR), subject to currency devaluation and local South African inflation.
* The Zimbabwean automotive trade is settled primarily in **United States Dollars ($ USD) cash**. Converting ZAR book values to USD using volatile parallel exchange rates introduces arbitrage errors.

### 4. Parts Availability & Durability Index (Gazaland / Kaguvi Street)
* In Zimbabwe, vehicle resale value is heavily dictated by maintenance feasibility on local road surfaces:
  - **High-Liquidity Premium (+10% to +35%):** Vehicles with abundant second-hand OEM replacement parts readily available in Harare's **Gazaland (Highfield)** and **Kaguvi Street** hubs (e.g. Toyota Hilux, Fortuner, Land Cruiser, Honda Fit, Toyota Aqua/Axio, Isuzu D-Max) command a strong market premium.
  - **Depreciation Penalty:** European luxury vehicles requiring specialized diagnostic computers and expensive air-freighted spares depreciate substantially faster.

---

## 5. Mathematical Formulation (ZMDVF-v1)

The valuation engine executes a deterministic calculation based on verifiable inputs:

### Core Equation

$$\text{Indicative Fair Market Value} = \left( C_{\text{landed}} \times (1 - D_{\text{cumulative}}) \times F_{\text{durability}} \right) + \Delta_{\text{mileage}} + \Delta_{\text{condition}} + \Delta_{\text{accident}} + \Delta_{\text{extras}}$$

Where:
* $C_{\text{landed}}$ = Landed cleared baseline cost in USD.
* $D_{\text{cumulative}}$ = Cumulative age-based depreciation rate:
  - Years $1$–$2$: Accelerated initial depreciation ($\text{Rate} \times 1.15$).
  - Years $3$–$6$: Normalized straight-line depreciation ($\text{Rate} \times 0.95$).
  - Years $7$–$10$: Plateau decay ($\text{Rate} \times 0.75$).
  - Over $10$ Years: Capped residual floor recognizing the 10-year import surtax cliff ($\text{Rate} \times 0.45$, capped at max $82\%$).
* $F_{\text{durability}}$ = Durability & parts liquidity multiplier ($1.00$ to $1.35$ for high-liquidity models; $0.85$ to $0.95$ for complex European imports).
* $\Delta_{\text{mileage}}$ = Mileage variance adjustment relative to the Zimbabwe annual expected benchmark of **$14,000\text{ km/year}$**:
  $$\Delta_{\text{mileage}} = V_{\text{depreciated}} \times \left( -\frac{\text{Actual km} - \text{Expected km}}{10,000} \times 0.012 \right)$$
* $\Delta_{\text{condition}}$ = Physical condition adjustment factor:
  - Excellent: $+7\%$
  - Good (Standard): $0\%$
  - Fair: $-9\%$
  - Poor: $-22\%$
  - Accident-Damaged: $-38\%$
* $\Delta_{\text{accident}}$ = Historical damage penalty:
  - None: $\$0$
  - Minor Restored: $-5\%$
  - Major Repaired: $-16\%$
* $\Delta_{\text{extras}}$ = Verified value-add accessories (canopy, bullbar, winch, dual battery, leather interior), capped conservatively at $\$2,500$.

### Value Output Spectrum

$$\text{Low Value (Liquidation / Dealer Trade-In)} = \text{Indicative Value} \times 0.88$$
$$\text{High Value (Retail Showroom / Dealership)} = \text{Indicative Value} \times 1.12$$

---

## 6. Audit & Defensibility for Stakeholders

| Stakeholder | How Famba's Valuation Protects Them |
| :--- | :--- |
| **Commercial Banks & Asset Financiers** | Protects against over-leveraged collateral. The Low Value indicates the safe forced liquidation threshold if a borrower defaults. |
| **Insurance Underwriters (Zimnat)** | Eliminates under-insurance disputes and over-insurance fraud. Provides an objective Sum-Insured backed by actual settlement audits. |
| **Corporate Fleet Managers** | Standardizes book depreciation, asset write-downs, and disposal reserve pricing across audit years. |
| **Car Buyers & Sellers** | Prevents informal classified price-gouging by providing a transparent, fair market benchmark. |

---

## 7. Cryptographic QR Verification Architecture

To prevent fraudulent manipulation or forged paper documents:
1. Every valuation certificate generates a unique audit reference (e.g. `ZIM-VAL-2026-8392`).
2. A cryptographic **QR Code** is permanently embedded into the certificate.
3. Scanning the QR code with any smartphone camera instantly opens the live record on `https://famba.co.zw/valuation/report/{REF}`, confirming:
   - Vehicle VIN and Chassis Number
   - Exact Valuation Date & 90-Day Expiry
   - Verified Fair Market, Trade-in, and Retail values
   - Engine breakdown and sample size confidence score

---

## 8. Summary Conclusion for Management

> **Famba’s vehicle valuation methodology is not an experimental or arbitrary formula. It is the direct adaptation of the International Valuation Standards Council (IVSC 200) and the SADC TransUnion standard, calibrated with empirical ZIMRA customs clearance data, local parts liquidity indexes, and real insurance settlement audits. It represents the most scientifically defensible vehicle valuation platform currently available in Zimbabwe.**

---
*Powered by KUNAKA TECH | Famba Automotive Platform | www.famba.co.zw*
