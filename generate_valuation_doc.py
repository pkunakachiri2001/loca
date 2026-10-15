import os
from fpdf import FPDF

class PDFReport(FPDF):
    def header(self):
        # Emerald banner header
        self.set_fill_color(0, 135, 103) # Famba Emerald Teal #008767
        self.rect(0, 0, 210, 14, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(255, 255, 255)
        self.set_xy(10, 3)
        self.cell(140, 8, 'FAMBA & ZIMNAT - ZIMBABWE MOTOR VEHICLE VALUATION PLATFORM')
        self.cell(50, 8, 'TECHNICAL GUIDE', align='R')
        self.ln(16)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()} | Zimbabwe Motor Vehicle Valuation Platform Technical Guide', align='C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 13)
        self.set_text_color(11, 25, 44) # Deep Navy
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(0, 135, 103)
        self.set_line_width(0.7)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 10.5)
        self.set_text_color(0, 135, 103) # Emerald
        self.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_p(self, text):
        self.set_font('Helvetica', '', 9.5)
        self.set_text_color(51, 65, 85) # Slate 700
        self.multi_cell(0, 5, text)
        self.ln(2)

    def bullet(self, bold_prefix, text):
        self.set_font('Helvetica', 'B', 9.5)
        self.set_text_color(15, 23, 42)
        prefix_full = f"- {bold_prefix} "
        self.write(5, prefix_full)
        self.set_font('Helvetica', '', 9.5)
        self.set_text_color(51, 65, 85)
        self.write(5, text)
        self.ln(6)

def create_guide_pdf():
    pdf = PDFReport()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # Title & Subtitle Banner
    pdf.set_fill_color(240, 253, 249) # Mint background
    pdf.rect(10, 20, 190, 28, 'F')
    pdf.set_draw_color(167, 243, 208)
    pdf.rect(10, 20, 190, 28, 'D')

    pdf.set_xy(14, 23)
    pdf.set_font('Helvetica', 'B', 15)
    pdf.set_text_color(0, 115, 88)
    pdf.cell(182, 7, 'Zimbabwe Motor Vehicle Valuation Platform', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 31)
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(182, 5, 'Implementation Architecture, Valuation Methodology & User Navigation Guide', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 38)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(182, 5, 'Date: October 2026 | Developed for: Zimnat Insurance Ecosystem & Famba Platform', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(12)

    # Chapter 1: Executive Overview
    pdf.chapter_title('1. Executive Overview & Problem Context')
    pdf.body_p(
        "In Zimbabwe, insurers, commercial banks, asset financiers, and car buyers face a persistent challenge: "
        "there has been no universally accepted, independent, and defensible vehicle valuation standard. Values have "
        "traditionally relied on informal references or raw international book values (such as South Africa's TransUnion Auto / Dealers Guide) "
        "which fail in Zimbabwe due to import customs tariffs, multi-currency dynamics, and local parts availability."
    )
    pdf.body_p(
        "To solve this, we have developed and integrated the Zimbabwe Motor Vehicle Valuation Platform directly into "
        "the Famba & Zimnat ecosystem. It provides a data-backed, defensible market valuation engine, a confidence scoring framework, "
        "underlying market comparables, and tamper-proof digital certificates with live QR verification."
    )
    pdf.ln(2)

    # Chapter 2: Key Differences
    pdf.chapter_title('2. Why Zimbabwe Car Pricing Differs from South Africa (SA)')
    pdf.body_p(
        "The platform accounts for six critical Zimbabwean economic and automotive realities that make simple South African Rand (ZAR) "
        "conversions inaccurate:"
    )
    pdf.bullet('1. Landed Import Dominance:', 'Over 85% of vehicles in Zimbabwe are imported (Japan, UK, SA). Prices reflect landed CIF plus port clearance, not domestic factory MSRP.')
    pdf.bullet('2. ZIMRA Customs & Surtax:', 'Customs duty (40% to 60%), Surtax (up to 35%), and 15% VAT mean a $3,000 import lands in Harare at $7,500 to $9,500.')
    pdf.bullet('3. The 10-Year Surtax Cliff:', 'Vehicles older than 10 years face punitive import penalties. Consequently, clean older cars already inside Zimbabwe retain significant cash utility value.')
    pdf.bullet('4. Parts & Mechanic Ecosystem:', 'Toyota (Hilux, Fortuner, Axio) and Honda Fit hold massive value retention due to abundant second-hand spares in Gazaland/Magaba, while European luxury cars depreciate rapidly.')
    pdf.bullet('5. Road Durability Premium:', 'High-ground-clearance pickups (Hilux, D-Max) and SUVs command strong durability premiums due to local road conditions.')
    pdf.bullet('6. Cash USD Pricing:', 'Vehicle transactions occur primarily in US Dollars cash, creating distinct retail vs forced liquidation spreads.')
    pdf.ln(4)

    # Chapter 3: Modules Implemented
    pdf.add_page()
    pdf.chapter_title('3. Architecture & What Has Been Implemented')
    pdf.body_p('The platform is built natively across the monorepo full stack:')

    pdf.section_title('A. Database Models (prisma/schema.prisma)')
    pdf.bullet('VehicleValuation:', 'Stores valuation requests, inputs (registration, VIN, mileage, condition, extras), results (low, indicative, high USD values), confidence score, sample size, methodology notes, and QR code data.')
    pdf.bullet('VehicleBenchmark:', 'Maintains base landed values, annual depreciation curves, brand durability ratings (e.g. 1.25x for Toyota), and parts liquidity rankings.')

    pdf.section_title('B. Valuation Engine (apps/api/src/services/valuation/)')
    pdf.bullet('benchmarks.ts:', 'Seed database covering 30+ top Zimbabwe models across Toyota, Honda, Mazda, Isuzu, Nissan, Ford, and VW.')
    pdf.bullet('engine.ts:', 'Calculates landed base replacement cost, age depreciation, mileage adjustments (+/- 1.2% per 10k km variance), condition ratings, and generates realistic local market comparables.')
    pdf.bullet('Confidence Algorithm:', 'Assigns High (sample >= 20, 90%+ match), Medium (80%+ match), or Low confidence.')
    pdf.bullet('QR Code Generator:', 'Generates cryptographic digital verification seals using qrcode.')

    pdf.section_title('C. Backend API Endpoints (apps/api/src/routes/valuation.ts)')
    pdf.bullet('POST /api/valuation/estimate:', 'Computes multi-factor vehicle valuation, saves to DB, returns report.')
    pdf.bullet('GET /api/valuation/:idOrRef:', 'Retrieves verified valuation record for live QR certificate checks.')
    pdf.bullet('GET /api/valuation/benchmarks:', 'Provides vehicle catalog for frontend autocomplete.')

    pdf.section_title('D. Web Frontend & Insurance Integration (apps/web/)')
    pdf.bullet('Valuation Wizard (/valuation):', 'Interactive 3-step valuation calculator with 1-click popular Zimbabwe model presets.')
    pdf.bullet('Digital Certificate (/valuation/report/[ref]):', 'Executive certificate with QR seal, print/PDF button, and comparable table.')
    pdf.bullet('Navigation Link:', 'Added "Vehicle Valuation" into the main Navbar.')
    pdf.bullet('Insurance Sync (/insurance):', 'Step 1 of insurance onboarding automatically connects to the valuation engine.')
    pdf.ln(4)

    # Chapter 4: Navigation Guide
    pdf.chapter_title('4. How to Navigate and Test the New Module')
    pdf.body_p('Follow these exact steps to view and test the valuation platform live:')

    pdf.section_title('Step 1: Access the Valuation Tool')
    pdf.bullet('Direct URL:', 'http://localhost:3000/valuation (or https://www.famba.co.zw/valuation)')
    pdf.bullet('Main Navigation:', 'Click on "Vehicle Valuation" in the main top navigation bar on any page.')

    pdf.section_title('Step 2: Try 1-Click Popular Vehicle Presets')
    pdf.body_p(
        'At the top of the /valuation page, click any of the preset chips for instant pre-filling:\n'
        '  - Toyota Fortuner 2.8 GD-6 (2019)\n'
        '  - Toyota Hilux GD-6 Double Cab (2021)\n'
        '  - Honda Fit Hybrid GP5 (2016)\n'
        '  - Isuzu D-Max 3.0 Ddi (2018)\n'
        '  - Mazda Demio 1.3 SkyActiv (2017)'
    )

    pdf.section_title('Step 3: Step-by-Step Custom Input')
    pdf.bullet('Step 1 (Specs):', 'Enter Make, Model, Variant, Year of Manufacture, Transmission, and Registration plate.')
    pdf.bullet('Step 2 (Condition):', 'Specify Odometer (e.g. 85,000 km), Condition (Excellent / Good / Fair), and Extras (Bullbar, Canopy).')
    pdf.bullet('Step 3 (Purpose):', 'Select primary purpose (Zimnat Insurance Quote, Bank Loan, Buying, or Selling) and click Generate.')

    pdf.section_title('Step 4: View the Digital Valuation Certificate')
    pdf.body_p(
        'The system generates an official report at /valuation/report/[ref] displaying:\n'
        '  - Indicative Market Value (e.g. $31,500 USD) and Low/High range.\n'
        '  - High Confidence Score badge (94%) with verified sample size.\n'
        '  - Underlying Zimbabwe Market Comparables table (Borrowdale, Msasa, Bulawayo).\n'
        '  - Scannable QR Code seal for authenticity verification.\n'
        '  - "Print / Save PDF" button for official paper records.\n'
        '  - "Get Zimnat Quote" button that seamlessly ports the value into the insurance flow.'
    )

    output_path = r'c:\Users\DELL\OneDrive\Desktop\Desktop3\mota\Zimbabwe_Vehicle_Valuation_Platform_Guide.pdf'
    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == '__main__':
    create_guide_pdf()
