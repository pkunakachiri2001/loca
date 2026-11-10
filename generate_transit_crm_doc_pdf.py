import os
from fpdf import FPDF
from fpdf.fonts import FontFace

class TransitDocPDF(FPDF):
    def header(self):
        # Emerald top band
        self.set_fill_color(0, 135, 103) # Famba Emerald #008767
        self.rect(0, 0, 210, 13, 'F')
        self.set_font('Helvetica', 'B', 8)
        self.set_text_color(255, 255, 255)
        self.set_xy(10, 2.5)
        self.cell(140, 8, 'FAMBA AUTOMOTIVE PLATFORM  |  CARS IN TRANSIT (CRM) & VALUATION INTEGRATION')
        self.cell(50, 8, 'TECHNICAL SPECIFICATION & ROADMAP', align='R')
        self.ln(15)

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(140, 140, 140)
        self.cell(0, 8, f'Page {self.page_no()}  |  Powered by KUNAKA TECH  |  Famba Mobility & Automotive Marketplace', align='C')

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
    pdf = TransitDocPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Document Header Box
    pdf.set_fill_color(245, 252, 250)
    pdf.set_draw_color(0, 135, 103)
    pdf.set_line_width(0.8)
    pdf.rect(10, 17, 190, 28, 'FD')

    pdf.set_xy(14, 20)
    pdf.set_font('Helvetica', 'B', 13.5)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(182, 6.5, 'Cars in Transit (Dealer CRM) & Valuation Integration', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 26.5)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(0, 135, 103)
    pdf.cell(182, 5, 'Technical Implementation, SADC Customs Logistics, & Strategic Automation Roadmap', new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(14, 33)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(182, 4.5, 'Author: KUNAKA TECH  |  Platform: Famba Zimbabwe  |  Framework: ZMDVF-v1  |  Currency: USD ($)', new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    # 1. Executive Summary & Purpose
    pdf.chapter_title('1. Purpose & Strategic Value Proposition')
    pdf.body_p(
        "Over 85% of passenger and light commercial vehicles sold by motor dealerships in Zimbabwe are imported from overseas markets, "
        "including Japan (via Be Forward, SBT Japan, USS Tokyo auctions), the United Kingdom, the United Arab Emirates, and South Africa. "
        "Historically, dealerships have operated with severe operational friction: fragmented WhatsApp communications with clearing agents, "
        "lost paper documentation, unpredictable port berthing dates, and uncertain ZIMRA customs assessments at Beitbridge or Forbes (Mutare). "
        "Crucially, incoming vehicles remained invisible to customers and financiers until physical delivery in Harare or Bulawayo, "
        "locking up operating capital for 30 to 45 days."
    )
    pdf.highlight_box(
        "Core Value Proposition for Car Dealers & Institutional Partners",
        "The Famba Cars in Transit CRM module transforms cross-border vehicle procurement into an automated, highly transparent digital supply chain. "
        "Dealers can log overseas purchases the moment an invoice is generated, calculate exact ZIMRA duties in advance, store clearance paperwork securely, "
        "and pre-market verified inventory on Famba's marketplace before physical arrival."
    )

    # 2. Scope of Work Completed So Far
    pdf.chapter_title('2. Technical Scope of Work Implemented')
    pdf.body_p(
        "The Cars in Transit CRM was engineered as an integrated enterprise module within the Famba ecosystem, "
        "ensuring zero regression risk to existing booking, rental, or valuation workflows:"
    )
    pdf.bullet("1. Synchronized Database Architecture:", "Added 3 relational models (TransitVehicle, TransitDocument, TransitEvent) and 4 enums (TransitStatus, PortOfDischarge, ZimbabweBorderPost, TransitDocumentType) to Prisma with company-level isolation.")
    pdf.bullet("2. Actuarial ZIMRA Duty Engine:", "Built transitCalculator.ts implementing statutory customs tariffs (25%-60%), the 10-year age surtax cliff (0%, 25%, 35%), 15% VAT, port handling charges ($450), and integrated market resale valuations.")
    pdf.bullet("3. Enterprise REST API Endpoints:", "Exposed full CRUD routing in apps/api/src/routes/transit.ts covering vehicle onboarding, document vault management, lifecycle stage advancement, and one-click conversion to marketplace listings.")
    pdf.bullet("4. Dealership Pipeline Dashboard:", "Created /company/transit featuring live KPI cards (Units in Pipeline, Total CIF Invested, ZIMRA Duty Liability, Projected Margin), multi-attribute filtering (port, border, status), and vehicle cards.")
    pdf.bullet("5. 4-Step Onboarding Wizard:", "Engineered /company/transit/new with 1-click popular presets (Hilux, Fortuner, Fit, Demio, D-Max) and a sticky, real-time ZIMRA duty and landed valuation calculation sidebar.")
    pdf.bullet("6. Vehicle Dossier & Paperwork Hub:", "Engineered /company/transit/[id] with an 8-stage visual progress tracker, ZIMRA duty assessment breakdown, advance document vault, and 1-click QR valuation certificate generator.")
    pdf.bullet("7. Resilience & Local Preview Engine:", "Equipped frontend with local storage synchronization and demo login so dealerships can test the entire workflow seamlessly in offline and demo environments.")
    pdf.ln(1)

    # PAGE 2
    pdf.add_page()

    # 3. Mathematical Formulation: Landed Cost & Valuation Integration
    pdf.chapter_title('3. Mathematical Formulation: Landed Cost & Valuation Integration')
    pdf.body_p(
        "The transit module establishes mathematical continuity between foreign procurement and domestic market value:"
    )

    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(203, 213, 225)
    pdf.rect(10, pdf.get_y(), 190, 25, 'FD')
    pdf.set_xy(12, pdf.get_y() + 2)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(186, 4.5, '1. Value for Duty Purposes (VDP) = CIF (USD) = FOB + Ocean Freight + Marine Transit Insurance', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(12, pdf.get_y())
    pdf.cell(186, 4.5, '2. Total Landed Cost = VDP + Customs Duty (25%-60%) + Surtax (0%-35%) + VAT (15%) + Port Handling ($450)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(12, pdf.get_y())
    pdf.cell(186, 4.5, '3. Projected Market Resale = Total Landed Cost * Durability Factor (1.15 to 1.30)', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(12, pdf.get_y() + 0.5)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(186, 3.8, 'Outputs: Total CIF Invested | ZIMRA Duty Liability | Total Landed Cost | Projected Retail Fair Value | Net Dealer Margin', new_x="LMARGIN", new_y="NEXT")
    pdf.set_y(pdf.get_y() + 9)

    pdf.bullet("The 10-Year Age Surtax Cliff:", "Under Zimbabwe statutory customs law, vehicles over 10 years of age incur punitive surtax rates (up to 35%). The engine applies an exact fiscal matrix to ensure dealerships do not under-budget border liabilities.")
    pdf.bullet("Durability & Parts Liquidity Index:", "Vehicles with proven longevity on Zimbabwean roads and readily available spares in Gazaland/Kaguvi Street (Toyota Hilux, Fortuner, Honda Fit) command a 1.25x-1.30x market multiplier over landed cost.")
    pdf.ln(1)

    # 4. Strategic Improvements & Future Roadmap
    pdf.chapter_title('4. Strategic Improvements & Future Automation Roadmap')
    pdf.body_p(
        "To eliminate manual status updates and establish Famba as the premier automotive operating system in the SADC region, "
        "the following five strategic improvements are slated for phased deployment:"
    )

    pdf.section_title('Improvement 1: Automated AIS Satellite Ocean Freight Tracking')
    pdf.body_p(
        "Instead of dealers having to manually check carrier sites (MOL, ONE, Hoegh, Grimaldi), Famba will integrate with AIS maritime APIs "
        "(MarineTraffic / AISHub). By capturing the Vessel Name and Bill of Lading (B/L) number, background workers track the vessel's coordinates across the Indian Ocean. "
        "When the ship crosses the port geofence at Durban, Beira, or Walvis Bay, Famba automatically advances the status from ON_VESSEL to ARRIVED_PORT and dispatches a WhatsApp alert."
    )

    pdf.section_title('Improvement 2: Clearing Agent WhatsApp Bot & Mobile ASYCUDA Portal')
    pdf.body_p(
        "To streamline border clearance at Beitbridge and Forbes (Mutare), Famba will deploy a lightweight clearing agent mobile link and WhatsApp webhook bot. "
        "The clearing agent simply texts the ASYCUDA Bill of Entry number (e.g., 'ASYCUDA 26-HRE-4892 CLEARED') and attaches a photo of the customs release order. "
        "Famba parses the document, stores it in the Advance Document Vault, and automatically advances the status to CLEARED_DELIVERED."
    )

    pdf.section_title('Improvement 3: Predictive Milestone Countdown Alerts')
    pdf.body_p(
        "Leveraging historical transit averages (Yokohama->Durban: 28-32 days; Durban->Beitbridge: 4-6 days; Beira->Forbes: 3-4 days), "
        "Famba tracks arrival countdowns. 72 hours before port docking, automated alerts notify dealers: "
        "'MV Morning Composer berthing in Durban in 72 hours. Please confirm port handling fees ($450) and carrier dispatch to avoid demurrage penalties.'"
    )

    pdf.section_title('Improvement 4: 1-Click Incoming Stock Marketplace Pre-Selling')
    pdf.body_p(
        "Vehicles currently in transit can be toggled as 'Incoming Stock' on the public Famba marketplace with an 'In Transit (Arriving in X Days)' badge. "
        "Prospective buyers can view the verified ZMDVF-v1 valuation certificate, review advance inspection documents, and place secure escrow reservation deposits."
    )

    pdf.section_title('Improvement 5: Embedded Advance Zimnat Insurance & ZIMRA Pre-Clearance (Deployed)')
    pdf.body_p(
        "Deployed core integration enabling dealerships to purchase 1-click advance marine cargo (GIT) and statutory road insurance policies "
        "issued directly to the vehicle chassis/VIN with authentic cryptographic verification QR discs, alongside comprehensive ZIMRA ASYCUDA "
        "Form 21 Bill of Entry and advance duty voucher tracking in the Document Vault."
    )
    pdf.ln(1)

    # PAGE 3
    pdf.add_page()

    # 5. Stakeholder Benefits Table (PROPERLY WRAPPED WITHOUT OVERFLOW)
    pdf.chapter_title('5. Stakeholder Value Matrix')
    pdf.body_p(
        "The Cars in Transit CRM module provides distinct operational, financial, and regulatory protections across the ecosystem:"
    )

    pdf.set_font('Helvetica', '', 7.5)
    head_style = FontFace(emphasis='B', color=(255, 255, 255), fill_color=(0, 135, 103))
    bold_style = FontFace(emphasis='B', color=(15, 23, 42))

    stakeholders = [
        ("Motor Dealerships", "Accelerates cash conversion cycles by 30-45 days via advance pre-selling, eliminates unexpected ZIMRA border duty shocks, and digitizes B/L paperwork."),
        ("Customs Clearing Agents", "Centralizes advance documents before vessel arrival, eliminating document chase delays and expediting ASYCUDA Bill of Entry processing."),
        ("Commercial Banks & Lenders", "Enables trade finance and inventory credit against verified goods in transit, backed by cryptographic ZMDVF-v1 valuation certificates."),
        ("Insurance Underwriters (Zimnat)", "Provides verified CIF values and transit milestones for underwriting marine cargo and overland SADC transit insurance policies."),
        ("Vehicle Buyers & Consumers", "Allows buyers to secure high-demand vehicles before arrival with transparent, verified landed costs and certified pre-shipment inspections.")
    ]

    with pdf.table(col_widths=(45, 145), line_height=4.8, headings_style=head_style) as t:
        header = t.row()
        header.cell('Stakeholder')
        header.cell('Direct Strategic & Operational Value')

        for entity, val in stakeholders:
            row = t.row()
            row.cell(entity, style=bold_style)
            row.cell(val)

    pdf.ln(6)

    # 6. Regulatory Alignment & Institutional Governance (Clean Executive Section - No Developer Bullets)
    pdf.chapter_title('6. Regulatory Alignment & Institutional Governance')
    pdf.body_p(
        "The Cars in Transit module adheres strictly to statutory Zimbabwean customs frameworks and internationally accepted asset valuation protocols:"
    )
    pdf.bullet("ZIMRA HS Tariff Compliance:", "Customs tariffs, surtaxes, and VAT calculations are aligned with the prevailing Customs and Excise Act [Chapter 23:02] and annual national budget statutory instruments.")
    pdf.bullet("IVSC IVS 200 Asset Standards:", "Landed cost formulas and depreciation schedules follow the International Valuation Standards Council (IVSC) standards for plant, machinery, and vehicles.")
    pdf.bullet("Audit Trail & Anti-Tampering:", "Every document upload, stage advancement, and customs assessment is logged with an immutable timestamped event record to prevent fraudulent declarations.")

    pdf.ln(5)

    # Official Sign-off Box
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(226, 232, 240)
    pdf.rect(10, pdf.get_y(), 190, 20, 'FD')
    pdf.set_xy(14, pdf.get_y() + 2.5)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.set_text_color(11, 25, 44)
    pdf.cell(182, 4, 'Official Platform Governance & Technical Inquiries:', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(14, pdf.get_y())
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(182, 4, 'Platform: Famba Zimbabwe  |  Engineering: KUNAKA TECH  |  Web: https://www.famba.co.zw', new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(14, pdf.get_y())
    pdf.cell(182, 4, 'Corporate & Dealership Inquiries: support@kunakatech.com  |  Harare, Zimbabwe', new_x="LMARGIN", new_y="NEXT")

    out_file = r'd:\Projects\Famba\CARS_IN_TRANSIT_CRM_IMPLEMENTATION_AND_METHODOLOGY.pdf'
    pdf.output(out_file)
    print(f"PDF successfully generated: {out_file}")

if __name__ == '__main__':
    generate_pdf()
