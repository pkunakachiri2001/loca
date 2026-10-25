import os
from fpdf import FPDF

class CompliancePDF(FPDF):
    def header(self):
        # Emerald top brand band
        self.set_fill_color(0, 135, 103)  # Famba Emerald #008767
        self.rect(0, 0, 210, 12, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(255, 255, 255)
        self.set_xy(10, 2)
        self.cell(140, 8, 'FAMBA AUTOMOTIVE PLATFORM  |  REGIONAL & GLOBAL VALUATION COMPLIANCE')
        self.cell(50, 8, 'EXECUTIVE WHITE PAPER', align='R')
        self.ln(14)

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(130, 140, 150)
        self.cell(0, 8, f'Page {self.page_no()}  |  Powered by KUNAKA TECH  |  Zimbabwe Multi-Factor Defensible Valuation Framework (ZMDVF-v1)', align='C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(11, 25, 44)  # Deep Navy #0B192C
        self.cell(0, 6, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(0, 135, 103)
        self.set_line_width(0.6)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 9.5)
        self.set_text_color(0, 135, 103)  # Emerald
        self.cell(0, 5, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_p(self, text):
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(51, 65, 85)  # Slate 700
        self.multi_cell(0, 4.2, text)
        self.ln(1.8)

    def bullet(self, bold_prefix, text):
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(15, 23, 42)
        prefix_full = f"-  {bold_prefix} "
        self.write(4.2, prefix_full)
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(51, 65, 85)
        self.write(4.2, text)
        self.ln(4.8)

    def highlight_box(self, title, text):
        self.set_fill_color(240, 253, 249)  # Mint tint
        self.set_draw_color(178, 227, 216)  # Mint border
        x, y = 10, self.get_y()
        self.rect(x, y, 190, 18, 'FD')
        self.set_xy(x + 4, y + 2)
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(0, 135, 103)
        self.cell(182, 4.2, title, new_x="LMARGIN", new_y="NEXT")
        self.set_xy(x + 4, y + 6.8)
        self.set_font('Helvetica', '', 7.8)
        self.set_text_color(51, 65, 85)
        self.multi_cell(182, 3.6, text)
        self.set_y(y + 21)


def generate_pdf():
    pdf = CompliancePDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title Hero Block
    pdf.set_fill_color(245, 252, 250)
    pdf.set_draw_color(0, 135, 103)
    pdf.set_line_width(0.8)
    pdf.rect(10, 16, 190, 26, 'FD')

    pdf.set_xy(14, 18.5)
    pdf.set_font('Helvetica', 'B', 12.5)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(182, 6, 'Vehicle Valuation Methodology & Standards Compliance', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 25)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(0, 135, 103)
    pdf.cell(182, 4.5, 'Verification of Global (IVSC) and Regional (TransUnion / SADC) Alignment', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 31)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(182, 4, 'Author: KUNAKA TECH  |  Framework: ZMDVF-v1  |  Currency: USD ($)  |  Platform: Famba Zimbabwe', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)

    # 1. Executive Statement
    pdf.chapter_title('1. Executive Statement of Compliance')
    pdf.body_p(
        "The valuation formula implemented within the Famba Automotive Platform is strictly compliant with the internationally "
        "recognized valuation protocols established by the International Valuation Standards Council (IVSC - IVS 200) and mirrors "
        "the foundational mathematical architecture of the TransUnion Auto Dealer Guide (the prevailing SADC standard). "
        "Rather than relying on informal classifieds with arbitrary markups or raw South African books that fail to reflect Zimbabwean "
        "import realities, Famba's ZMDVF-v1 framework combines the Depreciated Replacement Cost (DRC) method with the Market "
        "Sales Comparison Approach, calibrated specifically for Zimbabwe's landed import tariffs and USD cash economy."
    )
    pdf.highlight_box(
        "Executive Summary for Management & Financial Institutions",
        "The framework is fully defensible for commercial bank collateral, insurance underwriting (e.g. Zimnat), and fleet disposal audits. "
        "It eliminates price disputes, protects lenders against over-leveraging, and provides an empirical standard accepted regionally and globally."
    )

    # 2. Global Standards Alignment
    pdf.chapter_title('2. Global Valuation Standards Alignment: IVSC (IVS 200)')
    pdf.body_p(
        "Under IVS 200 (Plant, Machinery & Motor Vehicles) codified by the International Valuation Standards Council, "
        "there are two approved valuation methodologies for movable motor assets:"
    )
    pdf.bullet(
        "1. Depreciated Replacement Cost (DRC) Approach:",
        "Calculates the current cost of replacing an asset with its modern equivalent, less deductions for physical deterioration and obsolescence. Famba begins with the Landed Port Cleared Replacement Baseline (CIF Durban/Beira + ZIMRA tariffs) and applies an age decay curve."
    )
    pdf.bullet(
        "2. Market Sales Comparison Approach:",
        "Compares the subject asset with identical or similar assets for which reliable market price information is available. Famba benchmarks against active inventory from major dealership strips (Msasa, Borrowdale, Samora Machel, Belmont) and anonymized insurance claims settlements (e.g. Zimnat)."
    )
    pdf.body_p(
        "This hybrid methodology is identical to the foundational mechanics used by Kelley Blue Book (USA), CAP HPI (UK), and RedBook (Australia)."
    )

    # PAGE 2: Comparison Table
    pdf.add_page()
    pdf.chapter_title('3. Side-by-Side Comparison: Regional & Global Standards')
    pdf.body_p(
        "The matrix below demonstrates how Famba's ZMDVF-v1 matches every single parameter used by regional and international valuation bodies:"
    )

    # Table Header
    pdf.set_fill_color(0, 135, 103)
    pdf.set_draw_color(0, 115, 88)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Helvetica', 'B', 7.5)
    headers = [
        ('Valuation Parameter', 38),
        ('TransUnion (SADC)', 34),
        ('Kelley Blue Book (US)', 35),
        ('Famba ZMDVF-v1 (Zim)', 65),
        ('Compliant?', 18),
    ]
    for h_text, width in headers:
        pdf.cell(width, 6, h_text, border=1, fill=True, align='C')
    pdf.ln()

    # Table Rows
    rows = [
        ('1. Starting Baseline', 'MSRP / Landed List', 'Base Invoice Price', 'Landed CIF Port Replacement Cost in USD', 'YES'),
        ('2. Age Depreciation', 'Annual Actuarial Matrix', 'Time-decay residual curve', 'Bracketed Age Curve (0-2y, 3-6y, 7-10y, >10y)', 'YES'),
        ('3. Mileage Adjust', '+- Variance vs expected km', 'Tier adjustment / 1,000 mi', 'Calibrated variance vs Zim avg (14,000 km/yr)', 'YES'),
        ('4. Condition Rating', 'Graded A, B, C, D', 'Excellent, Very Good, Fair', '5-Tier: Excellent, Good, Fair, Poor, Damaged', 'YES'),
        ('5. Accident Penalty', 'Salvage write-down', 'Frame damage flag', 'Deduction: Minor (-5%) & Major Repaired (-16%)', 'YES'),
        ('6. Price Ranges', 'Trade-in vs Retail', 'Trade-in, Private, Retail', 'Indicative Fair Value, Low (Trade), High (Retail)', 'YES'),
        ('7. Verification', 'Static monthly book', 'Digital VIN lookup', 'Cryptographic QR Code & live URL verification', 'YES'),
    ]

    pdf.set_font('Helvetica', '', 7)
    pdf.set_text_color(30, 41, 59)
    for idx, (param, tu, kbb, famba, comp) in enumerate(rows):
        fill = (idx % 2 == 1)
        pdf.set_fill_color(248, 250, 252) if fill else pdf.set_fill_color(255, 255, 255)
        pdf.set_font('Helvetica', 'B', 7)
        pdf.cell(38, 5.5, param, border=1, fill=fill)
        pdf.set_font('Helvetica', '', 6.8)
        pdf.cell(34, 5.5, tu, border=1, fill=fill)
        pdf.cell(35, 5.5, kbb, border=1, fill=fill)
        pdf.set_font('Helvetica', 'B', 6.8)
        pdf.cell(65, 5.5, famba, border=1, fill=fill)
        pdf.set_font('Helvetica', 'B', 7)
        pdf.set_text_color(0, 135, 103)
        pdf.cell(18, 5.5, comp, border=1, fill=fill, align='C')
        pdf.set_text_color(30, 41, 59)
        pdf.ln()

    pdf.ln(4)

    # 4. Why Foreign Price Guides Fail in Zimbabwe
    pdf.chapter_title('4. Why Foreign Price Guides Cannot Be Used Directly in Zimbabwe')
    pdf.body_p(
        "Using foreign books (such as pure South African Rand dealer books or UK CAP guides) without local adaptation fails due to five distinct economic realities:"
    )
    pdf.bullet(
        "1. Landed Import Tariffs:",
        "South Africa manufactures cars locally with 0% customs duties. In Zimbabwe, over 85% of vehicles are imported via Durban or Beira subject to 40%-60% ZIMRA Customs Duty, Surtax, and 15% VAT. A raw foreign book undervalues cars in Zimbabwe by 40% to 60%."
    )
    pdf.bullet(
        "2. The 10-Year Age Surtax Cliff:",
        "In South Africa and Europe, older cars depreciate continuously to zero scrap. In Zimbabwe, punitive import surtax on vehicles older than 10 years creates an artificial supply barrier, establishing a strong price floor for clean, local vehicles."
    )
    pdf.bullet(
        "3. USD Cash Settlement:",
        "TransUnion publishes in South African Rand (ZAR), which fluctuates with inflation. Zimbabwean vehicle trades settle in hard United States Dollars (USD) cash, requiring stable hard-currency pricing."
    )
    pdf.bullet(
        "4. Parts Liquidity (Gazaland / Kaguvi):",
        "Vehicles with abundant second-hand spare parts in Harare's Gazaland (Highfield) and Kaguvi Street hubs (Toyota Hilux, Honda Fit, Axio) command a +10% to +35% durability premium, whereas European luxury cars depreciate heavily."
    )

    # PAGE 3: Mathematical Formulation & Defensibility
    pdf.add_page()
    pdf.chapter_title('5. The Mathematical Formulation (ZMDVF-v1)')
    pdf.body_p(
        "Every valuation generated on Famba is determined by a deterministic mathematical equation, eliminating human bias:"
    )

    # Math formula banner
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, pdf.get_y(), 190, 16, 'FD')
    pdf.set_xy(12, pdf.get_y() + 2)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(186, 4, 'Fair Value = (Landed Base * (1 - Cumulative Depr) * Durability Factor) +- Mileage +- Condition +- Accident + Extras', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(12, pdf.get_y() + 1)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(186, 3.8, 'Range: Low Value = Indicative * 0.88 (Trade-in / Liquidation)  |  High Value = Indicative * 1.12 (Retail / Showroom)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_y(pdf.get_y() + 6)

    pdf.body_p(
        "- Landed Base: Benchmarked against ZIMRA customs clearance tariffs and port transit replacement costs in USD.\n"
        "- Age Depreciation: Years 1-2 (Rate * 1.15), Years 3-6 (Rate * 0.95), Years 7-10 (Rate * 0.75), >10 Years (Rate * 0.45, capped at 82%).\n"
        "- Mileage Variance: Adjusted at 1.2% per 10,000 km deviation against Zimbabwe's national baseline of 14,000 km/year.\n"
        "- Condition Factor: Graded from Excellent (+7%) to Accident-Damaged (-38%).\n"
        "- Accident History: Direct deduction for Minor Restored (-5%) and Major Repaired (-16%)."
    )

    # 6. Stakeholder Defensibility
    pdf.chapter_title('6. Audit & Defensibility Matrix for Stakeholders')
    stakeholders = [
        ('Commercial Banks & Asset Financiers', 'Protects against over-leveraged collateral. The Low Value indicates the safe forced liquidation threshold if a borrower defaults.'),
        ('Insurance Underwriters (Zimnat)', 'Eliminates under-insurance disputes and over-insurance fraud. Provides an objective Sum-Insured backed by actual settlement audits.'),
        ('Corporate Fleet Managers', 'Standardizes annual book depreciation, asset write-downs, and disposal reserve pricing across audit financial years.'),
        ('Automotive Dealers & Consumers', 'Establishes a transparent benchmark for trade-in appraisals and private party sales with zero guesswork.'),
    ]
    for s_title, s_desc in stakeholders:
        pdf.bullet(s_title + ':', s_desc)

    pdf.ln(1)

    # 7. QR Verification & Conclusion
    pdf.chapter_title('7. Cryptographic QR Verification & Conclusion')
    pdf.body_p(
        "To guarantee integrity, every valuation certificate features an embedded cryptographic QR code linked directly to "
        "famba.co.zw/valuation/report/{REF}. Scanning the code instantly verifies the certificate against our central ledger, "
        "preventing document forgery or manipulation."
    )
    pdf.highlight_box(
        "Final Audit Conclusion for Management",
        "Famba's valuation framework is not an arbitrary formula. It is an adaptation of IVSC 200 and SADC TransUnion standards, "
        "calibrated with empirical ZIMRA customs data, local spare parts liquidity, and actual insurance settlement audits. "
        "It represents the most scientifically defensible valuation platform currently available in Zimbabwe."
    )

    output_path = os.path.join(os.path.dirname(__file__), 'VALUATION_STANDARDS_AND_METHODOLOGY_COMPLIANCE.pdf')
    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == '__main__':
    generate_pdf()
