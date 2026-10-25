import os
from fpdf import FPDF

class TransparencyPDF(FPDF):
    def header(self):
        # Emerald top band
        self.set_fill_color(0, 135, 103) # Famba Emerald #008767
        self.rect(0, 0, 210, 13, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(255, 255, 255)
        self.set_xy(10, 2.5)
        self.cell(140, 8, 'FAMBA AUTOMOTIVE PLATFORM  |  EXECUTIVE TRANSPARENCY & METHODOLOGY BRIEF')
        self.cell(50, 8, 'CONFIDENTIAL & TRUSTED', align='R')
        self.ln(15)

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(140, 140, 140)
        self.cell(0, 8, f'Page {self.page_no()}  |  Powered by KUNAKA TECH  |  Zimbabwe Motor Vehicle Valuation Framework', align='C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 11.5)
        self.set_text_color(11, 25, 44) # Deep Navy #0B192C
        self.cell(0, 6.5, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(0, 135, 103)
        self.set_line_width(0.6)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(2.5)

    def section_title(self, title):
        self.set_font('Helvetica', 'B', 9.5)
        self.set_text_color(0, 135, 103) # Emerald
        self.cell(0, 5, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(0.5)

    def body_p(self, text):
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(51, 65, 85) # Slate 700
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
        self.ln(5)

    def highlight_box(self, title, text):
        self.set_fill_color(240, 253, 249) # Mint background
        self.set_draw_color(178, 227, 216) # Mint border
        x, y = 10, self.get_y()
        self.rect(x, y, 190, 19, 'FD')
        self.set_xy(x + 4, y + 2)
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(0, 135, 103)
        self.cell(182, 4.5, title, new_x="LMARGIN", new_y="NEXT")
        self.set_xy(x + 4, y + 7)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(51, 65, 85)
        self.multi_cell(182, 3.8, text)
        self.set_y(y + 22)

def generate_pdf():
    pdf = TransparencyPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Document Header Box
    pdf.set_fill_color(245, 252, 250)
    pdf.set_draw_color(0, 135, 103)
    pdf.set_line_width(0.8)
    pdf.rect(10, 17, 190, 27, 'FD')

    pdf.set_xy(14, 20)
    pdf.set_font('Helvetica', 'B', 13.5)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(182, 6.5, 'Vehicle Valuation Methodology & Data Architecture', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 26.5)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(0, 135, 103)
    pdf.cell(182, 5, 'Executive Brief for Corporate Partners, Dealerships, Insurers & Financiers', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 33)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(182, 4.5, 'Author: KUNAKA TECH  |  Platform: Famba Zimbabwe  |  Framework: ZMDVF-v1  |  Currency: USD ($)', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(9)

    # 1. Executive Summary
    pdf.chapter_title('1. Purpose & Executive Summary')
    pdf.body_p(
        "For decades, the Zimbabwean automotive market has struggled with subjective, speculative, or inaccurate car pricing. "
        "Car buyers, corporate fleet managers, insurance underwriters, and commercial banks frequently rely on informal classified ads "
        "with arbitrary seller markups, or raw South African book values (TransUnion) that fail to capture Zimbabwean import reality. "
        "The Famba Vehicle Valuation Platform eliminates this ambiguity by providing an independent, objective, data-backed, "
        "and defensible valuation model specifically built for Zimbabwe's economic ecosystem."
    )
    pdf.highlight_box(
        "Core Value Proposition for Partner Companies",
        "This platform establishes a single source of truth for fair market vehicle pricing in Zimbabwe. It guarantees full transparency, "
        "eliminates price inflation disputes, expedites insurance underwriting, and protects asset financiers against loan collateral overvaluation."
    )

    # 2. Why Traditional & Foreign Books Fail in Zimbabwe
    pdf.chapter_title('2. Why Traditional Valuation Books Fail in Zimbabwe')
    pdf.body_p(
        "Foreign price guides (such as South African Rand dealer books or UK CAP guides) cannot be directly applied to Zimbabwe due to five structural factors:"
    )
    pdf.bullet("1. Landed Import Dominance:", "Over 85% of vehicles on Zimbabwean roads are imported from Japan (via Beira/Durban), the UK, or South Africa. Prices reflect total landed clearing costs rather than original manufacturer MSRP.")
    pdf.bullet("2. ZIMRA Tariffs & Surtax:", "Customs duty (40%-60%), Surtax (up to 35%), and 15% VAT mean that a $3,500 car purchased in Japan lands in Harare between $8,000 and $10,500.")
    pdf.bullet("3. The 10-Year Age Cliff:", "ZIMRA imposes punitive import duties on vehicles older than 10 years. Consequently, clean, roadworthy older vehicles already registered inside Zimbabwe hold a strong price floor and do not depreciate to zero.")
    pdf.bullet("4. Parts Liquidity Ecosystem:", "Vehicles with abundant second-hand spares in Gazaland (Highfield) and Kaguvi Street (Toyota Hilux, Honda Fit) command high resale premiums, whereas European luxury cars depreciate heavily.")
    pdf.bullet("5. USD Cash Economy:", "Zimbabwean automotive trades settle primarily in United States Dollars (USD) cash, creating a clear gap between retail asking prices and actual forced liquidation values.")
    pdf.ln(1)

    # PAGE 2
    pdf.add_page()

    # 3. The 4 Defensible Data Sources
    pdf.chapter_title('3. The 4 Authoritative Data Sources Driving the Engine')
    pdf.body_p(
        "Famba combines macroeconomic clearing benchmarks with active marketplace observations and real insurance settlement audits:"
    )

    pdf.section_title('Data Source 1: ZIMRA Customs & Landed Clearance Benchmark Database')
    pdf.body_p(
        "The engine maintains an empirical baseline of 33+ core vehicle models in Zimbabwe across Toyota, Honda, Mazda, Isuzu, "
        "Nissan, Ford, Volkswagen, Mercedes-Benz, and BMW. Each benchmark records the exact landed port replacement cost in USD, "
        "inclusive of prevailing import duty brackets, port transit fees, and clearing surtaxes."
    )

    pdf.section_title('Data Source 2: Active Showroom & Dealership Inventory in Key Hubs')
    pdf.body_p(
        "The system aggregates real-time asking prices and dealer inventory across key Zimbabwean commercial motor clusters:\n"
        "  - Harare: Msasa Automotive Strip, Borrowdale Motor Hub, Samora Machel Avenue Motor City\n"
        "  - Bulawayo: Belmont Commercial Auto Row\n"
        "  - Midlands: Gweru Automotive Traders\n"
        "This ensures that vehicle valuations reflect real inventory available on the ground today."
    )

    pdf.section_title('Data Source 3: Historical Insurance Claims & Actual Settlement Audits')
    pdf.body_p(
        "Asking prices on public classifieds frequently contain a 15% to 25% speculative markup. To ensure true market reality, "
        "the engine incorporates anonymized insurance claim payout data and write-off settlement audits (e.g., Zimnat Insurance claim audits). "
        "Every valuation differentiates between asking prices and actual verified transactions where real money changed hands."
    )

    pdf.section_title('Data Source 4: Local Spare Parts & Durability Index (Gazaland / Kaguvi Spares)')
    pdf.body_p(
        "Vehicles in Zimbabwe are graded by maintenance feasibility. Pickups with high ground clearance (Toyota Hilux, Isuzu D-Max) "
        "and popular commuter cars (Honda Fit, Toyota Aqua/Axio) are assigned a Durability & Liquidity Premium (+10% to +35%), "
        "while vehicles requiring expensive imported electronic diagnostic components receive appropriate risk depreciation."
    )
    pdf.ln(1)

    # 4. The Valuation Mathematical Formulation
    pdf.chapter_title('4. The Mathematical Formulation (ZMDVF-v1)')
    pdf.body_p(
        "Every valuation generated on Famba is determined by a deterministic mathematical equation, eliminating guesswork:"
    )

    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, pdf.get_y(), 190, 22, 'FD')
    pdf.set_xy(12, pdf.get_y() + 2)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(186, 4.5, 'Indicative Fair Value = (Base Landed Value * Depreciation * Durability Factor)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(12, pdf.get_y())
    pdf.cell(186, 4.5, '                           +/- Mileage Adjustment +/- Condition Adjustment + Extras', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(12, pdf.get_y() + 0.5)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(186, 3.8, 'Outputs: 1. Indicative Fair Value (USD)  |  2. Low Range (Liquidation / Trade-In)  |  3. High Range (Retail Showroom)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_y(pdf.get_y() + 8)

    pdf.bullet("Mileage Calibration:", "Benchmarked against Zimbabwe's national usage rate of 14,000 km/year. Every 10,000 km deviation applies a +/- 1.2% fair value adjustment.")
    pdf.bullet("Condition & Body Rating:", "Calculated strictly across 5 certified states: Excellent (+7%), Good (Baseline 0%), Fair (-9%), Poor (-22%), and Accident Damaged (-38%).")
    pdf.bullet("Verified Factory Extras:", "Recognizes value additions such as genuine canopies, heavy-duty bullbars, winches, and long-range fuel tanks up to a $2,500 ceiling.")

    # PAGE 3
    pdf.add_page()

    # 5. Data Access Architecture & Live API Clarification (NEW SECTION)
    pdf.chapter_title('5. Data Architecture: Self-Contained Engine vs. Live Third-Party APIs')
    pdf.body_p(
        "A critical question from partners is whether Famba relies on live third-party REST APIs on every search. "
        "The short answer is NO: Famba utilizes a self-contained, high-performance local benchmark engine paired with PostgreSQL persistence and in-memory caching. "
        "This architectural decision was made for three vital operational reasons:"
    )

    pdf.bullet("1. No Centralized Public API Exists in Zimbabwe:", "Unlike developed markets with centralized DMV/Carfax or Kelley Blue Book APIs, Zimbabwe has no unified open automotive data feed. Foreign APIs (e.g. South Africa TransUnion) price in ZAR and exclude Zimbabwean customs duty.")
    pdf.bullet("2. Zero Latency & Guaranteed 100% Uptime:", "Calling an external API on every user query creates network lag (2-5 seconds), dependency on external server uptime, and connection failures. Famba's local engine returns defensible results in under 50 milliseconds.")
    pdf.bullet("3. Zero Cost Overhead:", "Foreign automotive API providers charge $1.50 to $3.00 per lookup query. By running a compiled local engine, Famba passes zero query charges to users and partners.")

    pdf.section_title('How Data Freshness & Ongoing Updates Are Maintained:')
    pdf.bullet("Quarterly / Fiscal Re-calibration:", "Whenever ZIMRA gazettes national budget changes, customs duty bracket adjustments, or surtax revisions, the VehicleBenchmark ledger is updated to reflect new landed replacement baselines.")
    pdf.bullet("Scheduled Marketplace Sync (Cron Worker):", "The system architecture is equipped with scheduled background workers that periodically aggregate moving average prices across verified Harare/Bulawayo dealer inventories.")
    pdf.bullet("Direct Partner Live Ingestion (Enterprise Feeds):", "For strategic partners such as Zimnat Insurance or major fleet groups, the backend supports direct ingestion of anonymized claims settlements and showroom price feeds via REST webhook.")
    pdf.ln(1)

    # 6. Anti-Manipulation & Quality Assurance
    pdf.chapter_title('6. Quality Assurance, Confidence Scoring & Anti-Tampering')
    pdf.body_p(
        "To provide total trust when presenting certificates to banks or insurance underwriters, every valuation report incorporates three layers of verification:"
    )
    pdf.bullet("1. Transparent Confidence Rating:", "Every report states its Confidence Level (High 94%, Medium 82%, Low 68%) alongside the exact number of comparable market vehicles analyzed.")
    pdf.bullet("2. Cryptographic QR Verification:", "Each certificate features a unique QR code linked directly to Famba's cloud ledger (e.g., https://famba.co.zw/valuation/report/ZIM-VAL-2026-XXXX). Scanning the QR code instantly verifies if the document is authentic and unmodified.")
    pdf.bullet("3. 90-Day Market Validity:", "Certificates carry a fixed 90-day validity window to prevent obsolete valuations during economic or fiscal policy adjustments.")
    pdf.ln(1)

    # 7. Benefits for Corporate Stakeholders
    pdf.chapter_title('7. Direct Benefits for Partner Organizations')

    # Table of benefits
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_fill_color(0, 135, 103)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(48, 6.5, 'Stakeholder', border=1, fill=True)
    pdf.cell(142, 6.5, 'Direct Operational & Financial Value', border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(30, 41, 59)

    stakeholders = [
        ("Motor Dealerships", "Accelerates trade-in negotiations, eliminates customer disputes, and validates pricing against active competitor stock."),
        ("Corporate Fleets", "Enables accurate asset depreciation schedules, optimal fleet replacement timing, and audit-ready balance sheet valuations."),
        ("Insurance Companies", "Prevents over-insurance (inflated premiums and fraudulent claims) and under-insurance (customer dissatisfaction at claim time)."),
        ("Banks & Financiers", "Establishes accurate loan-to-value (LTV) ratios on vehicle asset financing, protecting against loan default shortfalls."),
        ("Private Buyers & Sellers", "Provides impartial, third-party pricing evidence to prevent overpaying or selling below true market worth.")
    ]

    for entity, val in stakeholders:
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.cell(48, 7, entity, border=1)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.cell(142, 7, val, border=1, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)

    # 8. Official Sign-off & Verification
    pdf.chapter_title('8. Official Verification & Technical Endorsement')
    pdf.body_p(
        "The Zimbabwe Motor Vehicle Valuation Platform is developed and maintained by KUNAKA TECH as part of the Famba "
        "automotive ecosystem. The algorithms, benchmark catalogs, and comparative datasets undergo continuous calibration against "
        "customs gazettes, statutory instruments, and physical dealership surveys across Zimbabwe."
    )

    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(226, 232, 240)
    pdf.rect(10, pdf.get_y(), 190, 20, 'FD')
    pdf.set_xy(14, pdf.get_y() + 2.5)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(182, 4, 'Official Platform & Verification Inquiries:', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(14, pdf.get_y())
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(182, 4, 'Platform: Famba Zimbabwe  |  Engineering: KUNAKA TECH  |  Web: https://www.famba.co.zw/valuation', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(14, pdf.get_y())
    pdf.cell(182, 4, 'Corporate Partner Support: support@kunakatech.com  |  Harare, Zimbabwe', new_x="LMARGIN", new_y="NEXT")

    out_file = r'c:\Users\DELL\OneDrive\Desktop\Desktop3\mota\Famba_Vehicle_Valuation_Methodology_and_Data_Sources.pdf'
    pdf.output(out_file)
    print(f"PDF successfully updated: {out_file}")

if __name__ == '__main__':
    generate_pdf()
