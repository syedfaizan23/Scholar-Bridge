from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.scholarships.models import Scholarship
from datetime import date
import secrets

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed scholarships with future deadlines (2026-2027 cycle)'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(email='admin@scholarbridge.com').exists():
            # Random password each run — printed once below, save it immediately.
            generated_password = secrets.token_urlsafe(12)
            User.objects.create_superuser(
                username='admin', email='admin@scholarbridge.com',
                password=generated_password, first_name='Admin', last_name='User', role='admin')
            self.stdout.write(self.style.SUCCESS(
                f'Admin created: admin@scholarbridge.com / {generated_password}'
            ))
            self.stdout.write(self.style.WARNING(
                'Save this password now — log in and change it immediately. It will not be shown again.'
            ))

        if Scholarship.objects.exists():
            self.stdout.write(self.style.WARNING(
                f'{Scholarship.objects.count()} scholarships already exist — skipping seed. '
                'Delete them manually first if you really want to reseed '
                '(note: that will also delete any applications already submitted against them).'
            ))
            return

        # Reset SQLite auto-increment so IDs start from 1
        from django.db import connection
        with connection.cursor() as cursor:
            try:
                cursor.execute("DELETE FROM sqlite_sequence WHERE name='scholarships_scholarship'")
            except Exception:
                pass  # PostgreSQL doesn't need this

        scholarships = [
            # ══ GERMANY ═══════════════════════════════════════════════════════
            dict(
                title='DAAD Graduate Scholarship 2027',
                university_name='All German Public Universities',
                country='Germany', degree_level='master',
                required_cgpa=2.5, required_percentage=60.0, ielts_required=6.0,
                scholarship_amount='€992/month + Tuition Waiver + Travel Allowance',
                application_deadline=date(2026, 10, 31), seats_available=200,
                description='The German Academic Exchange Service (DAAD) offers scholarships to graduates from developing countries for postgraduate studies in Germany. Germany has zero tuition fees at public universities. The scholarship includes a monthly stipend of €992, health insurance, and travel costs. Available across 400+ German universities in all disciplines including engineering, CS, medicine, social sciences, and humanities.',
                eligibility_criteria='Citizen of an eligible developing or transition country (including Pakistan). Minimum 60% marks / 2.5 CGPA. Max age 32. IELTS 6.0 or TOEFL iBT 72. Must apply to a German university simultaneously. No prior long-stay in Germany (>15 months in past 3 years).',
                application_link='https://www.daad.de/en/study-and-research-in-germany/scholarships/',
            ),
            dict(
                title='Deutschlandstipendium National Scholarship 2026-27',
                university_name='150+ German Universities',
                country='Germany', degree_level='bachelor',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=5.5,
                scholarship_amount='€300/month for minimum 2 semesters',
                application_deadline=date(2026, 11, 30), seats_available=500,
                description='Germany\'s national scholarship co-funded by the government and private sponsors. Open to all nationalities. Recognises academic excellence, social engagement, and personal achievements. Apply through your German university after being admitted. No tuition fees in Germany means €300/month goes entirely towards living expenses.',
                eligibility_criteria='Enrolled or about to enrol in a German university bachelor\'s or master\'s. Minimum 70% / 3.0 CGPA. IELTS 5.5 or German B2. Evidence of social engagement or leadership. No nationality restrictions — international students fully eligible.',
                application_link='https://www.deutschlandstipendium.de/en/',
            ),
            dict(
                title='Helmut Schmidt Programme — Public Policy 2027',
                university_name='University of Hamburg, Erfurt & Konstanz',
                country='Germany', degree_level='master',
                required_cgpa=2.5, required_percentage=60.0, ielts_required=6.0,
                scholarship_amount='€992/month + Full Tuition + Health Insurance + Travel',
                application_deadline=date(2026, 10, 31), seats_available=60,
                description='DAAD programme supporting future governance leaders from developing countries. Master\'s in public policy, political science, economics, law, or social sciences at selected German universities. Full scholarship covering all expenses. Aims to train the next generation of decision-makers who will return and improve governance in their home countries.',
                eligibility_criteria='Pakistani citizens eligible. Bachelor\'s in law, political science, economics, or social sciences. Minimum 60% / 2.5 CGPA. IELTS 6.0 or TOEFL iBT 72. Under 36 years. Proven interest in public policy and governance.',
                application_link='https://www.daad.de/en/study-and-research-in-germany/scholarships/helmut-schmidt-programme/',
            ),
            # ══ UK ════════════════════════════════════════════════════════════
            dict(
                title='Chevening Scholarships UK 2027-28',
                university_name='Any UK University of Your Choice',
                country='UK', degree_level='master',
                required_cgpa=2.8, required_percentage=65.0, ielts_required=6.5,
                scholarship_amount='Full Tuition + £1,273/month Living + Return Flights + Visa',
                application_deadline=date(2026, 11, 3), seats_available=50,
                description='Chevening is the UK Government\'s flagship international scholarship funded by the FCDO. Fully funded one-year master\'s at any UK university. Selects future leaders who will make a positive difference in their home countries. Monthly allowance of £1,273, full tuition, return airfare, and visa fees all covered. Pakistan is one of the largest Chevening recipient countries.',
                eligibility_criteria='Citizen of an eligible Chevening country (including Pakistan). Minimum 65% / 2.8 CGPA. At least 2 years (2,800 hours) of work experience. IELTS 6.5, no band below 5.5. Apply to three different UK university courses. Must return to your home country for minimum 2 years after scholarship.',
                application_link='https://www.chevening.org/scholarships/',
            ),
            dict(
                title='University of Nottingham Developing Solutions 2027',
                university_name='University of Nottingham',
                country='UK', degree_level='master',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=6.5,
                scholarship_amount='50% or 100% Tuition Fee Scholarship',
                application_deadline=date(2027, 3, 1), seats_available=105,
                description='Specifically for students from Pakistan, India, and Africa. University of Nottingham (ranked top 120 globally) covers 50–100% of master\'s tuition. Strong programmes in engineering, computer science, business, pharmacy, and life sciences. Nottingham has one of the UK\'s most vibrant South Asian student communities.',
                eligibility_criteria='For citizens of Pakistan, India, or eligible African countries — no global competition, only applicants from these regions are considered. Minimum 70% / 3.0 CGPA. IELTS 6.5, no band below 6.0. Full-time on-campus master\'s at Nottingham UK campus. Personal statement on contribution to your home country\'s development required.',
                application_link='https://www.nottingham.ac.uk/studywithus/international-applicants/scholarships-and-funding/developing-solutions-masters-scholarship.aspx',
            ),
            dict(
                title='University of Edinburgh Global Scholarship 2027',
                university_name='University of Edinburgh',
                country='UK', degree_level='master',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=6.5,
                scholarship_amount='£5,000 Tuition Fee Reduction',
                application_deadline=date(2027, 3, 31), seats_available=100,
                description='Edinburgh (ranked #22 globally, QS 2025) offers £5,000 tuition reduction for international master\'s students. Strong in AI/ML, Data Science, Business, Engineering, Law, and Medicine. Located in one of Europe\'s most beautiful capital cities. Multiple application rounds — apply early for best chances.',
                eligibility_criteria='International (non-UK) students. Minimum 70% / 3.0 CGPA. IELTS 6.5, no band below 6.0. Offer of admission to eligible on-campus master\'s. Must not hold another Edinburgh scholarship.',
                application_link='https://www.ed.ac.uk/student-funding/postgraduate/international/global/global-scholarship',
            ),
            dict(
                title='University of Manchester Global Futures 2027',
                university_name='University of Manchester',
                country='UK', degree_level='master',
                required_cgpa=3.2, required_percentage=75.0, ielts_required=6.5,
                scholarship_amount='£10,000 Tuition Fee Scholarship',
                application_deadline=date(2027, 4, 30), seats_available=75,
                description='Russell Group university (ranked #32 globally). £10,000 scholarship for outstanding international master\'s students. Manchester is the UK\'s most popular student city outside London with a large South Asian community. Strong engineering, CS, business, and life sciences faculties.',
                eligibility_criteria='International (non-UK) students. Minimum 75% / 3.2 CGPA. IELTS 6.5. Self-funded students only. Separate application after receiving admission offer.',
                application_link='https://www.manchester.ac.uk/study/international/student-support/scholarships-and-awards/',
            ),
            # ══ NETHERLANDS ═══════════════════════════════════════════════════
            dict(
                title='Holland Scholarship 2027-28',
                university_name='Dutch Universities & Universities of Applied Sciences',
                country='Netherlands', degree_level='bachelor',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=6.0,
                scholarship_amount='€5,000 One-Time Grant (First Year)',
                application_deadline=date(2027, 2, 1), seats_available=200,
                description='Dutch Ministry of Education funded scholarship for international bachelor\'s and master\'s students. Netherlands has world-class universities — TU Delft, University of Amsterdam, Utrecht, Wageningen — many teaching entirely in English. €5,000 is paid in the first year. Netherlands offers one of Europe\'s highest qualities of life with excellent career prospects.',
                eligibility_criteria='Non-EU/EEA nationality — Pakistani students fully eligible. Applying to bachelor\'s or master\'s at a participating Dutch institution. Minimum 70% / 3.0 CGPA. IELTS 6.0. Must not have previously studied in the Netherlands.',
                application_link='https://www.studyinholland.nl/scholarships/holland-scholarship',
            ),
            dict(
                title='TU Delft Excellence Scholarship (DSES) 2027',
                university_name='Delft University of Technology (TU Delft)',
                country='Netherlands', degree_level='master',
                required_cgpa=3.5, required_percentage=80.0, ielts_required=6.5,
                scholarship_amount='€30,000 Total Over Full 2-Year Master\'s',
                application_deadline=date(2027, 1, 31), seats_available=25,
                description='TU Delft (ranked #13 globally for Engineering, QS 2025) awards its Excellence Scholarship to the brightest non-EEA international students. The €30,000 over 2 years covers significant tuition and living costs. Available across Computer Science, Aerospace, Civil Engineering, Applied Mathematics, and Architecture. TU Delft graduates are among the world\'s most employable engineers.',
                eligibility_criteria='Non-EEA/non-Dutch nationality. Applying for TU Delft master\'s starting September 2027. Minimum 80% / 3.5 CGPA — top 10% of your graduating class. IELTS 6.5. Must receive TU Delft admission offer first. Strong motivation letter and two academic references required.',
                application_link='https://www.tudelft.nl/en/education/practical-matters/scholarships/tu-delft-excellence-scholarships',
            ),
            # ══ SWEDEN ════════════════════════════════════════════════════════
            dict(
                title='Swedish Institute Scholarship (SISGP) 2027',
                university_name='Uppsala, Stockholm, KTH, Lund, Chalmers & 80+ Universities',
                country='Sweden', degree_level='master',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=6.5,
                scholarship_amount='SEK 11,000/month (~$1,030) + Full Tuition + Travel + Insurance',
                application_deadline=date(2027, 2, 10), seats_available=350,
                description='One of the most sought-after scholarships for future change-makers. Supports full-time master\'s at Swedish universities. Covers full tuition, SEK 11,000/month living allowance, travel grant, and insurance for the entire master\'s duration (1-2 years). Sweden ranks among the top countries globally for quality of life, innovation, and gender equality.',
                eligibility_criteria='Pakistan is on the SISGP eligible country list. Minimum 3,000 hours (~2 years) of documented paid work experience after bachelor\'s. Minimum 70% / 3.0 CGPA. IELTS 6.5. Leadership experience and commitment to sustainable development required. Maximum age 35.',
                application_link='https://si.se/en/apply/scholarships/swedish-institute-scholarship-for-global-professionals/',
            ),
            # ══ SWITZERLAND ═══════════════════════════════════════════════════
            dict(
                title='ETH Zurich Excellence Scholarship 2027',
                university_name='ETH Zurich (Swiss Federal Institute of Technology)',
                country='Switzerland', degree_level='master',
                required_cgpa=3.7, required_percentage=90.0, ielts_required=7.0,
                scholarship_amount='CHF 12,000/year + Full Tuition Waiver',
                application_deadline=date(2026, 12, 15), seats_available=120,
                description='ETH Zurich — ranked #7 globally (QS 2025) and Europe\'s #1 STEM university — awards its Excellence Scholarship to the most talented incoming master\'s students. Fellows receive CHF 12,000/year plus tuition waiver and a dedicated ETH professor mentor. Available in Computer Science, Data Science, Engineering, Materials, Architecture, Physics, and Natural Sciences.',
                eligibility_criteria='Must first be admitted to ETH Zurich master\'s programme. Top 10% academic standing — minimum 3.7 CGPA / 90% marks. IELTS 7.0 or TOEFL iBT 100. Apply by December 15 for autumn-start master\'s. First-year students only.',
                application_link='https://ethz.ch/en/studies/financial/scholarships/excellencescholarship.html',
            ),
            dict(
                title='Swiss Government Excellence Scholarship 2027',
                university_name='ETH Zurich, EPFL, University of Zurich, Bern, Geneva, Basel',
                country='Switzerland', degree_level='phd',
                required_cgpa=3.5, required_percentage=85.0, ielts_required=6.5,
                scholarship_amount='CHF 1,920/month + Tuition + Health Insurance + Housing Supplement',
                application_deadline=date(2026, 11, 15), seats_available=30,
                description='Swiss Confederation scholarship promoting international research cooperation, offered to applicants from over 40 eligible countries (including Pakistan) through their national embassy or ministry of education. PhD research at top Swiss universities including ETH Zurich and EPFL. Monthly stipend CHF 1,920 plus tuition, health insurance, and housing supplement. Switzerland has world-leading research infrastructure in STEM, finance, and life sciences.',
                eligibility_criteria='Citizen of an eligible country, applying through your national embassy or nominating authority (Pakistani applicants apply through the Pakistani Embassy). PhD: master\'s degree with minimum 85% / 3.5 CGPA. IELTS 6.5. Letter of support from a Swiss professor required. Under 35 years for PhD scholarships.',
                application_link='https://www.sbfi.admin.ch/sbfi/en/home/education/scholarships-and-grants/swiss-government-excellence-scholarships.html',
            ),
            # ══ BELGIUM ═══════════════════════════════════════════════════════
            dict(
                title='VLIR-UOS Scholarship — KU Leuven 2027',
                university_name='KU Leuven (Ranked Top 50 Globally)',
                country='Belgium', degree_level='master',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=6.5,
                scholarship_amount='€900/month + Full Tuition + Return Flight + Insurance',
                application_deadline=date(2027, 2, 1), seats_available=50,
                description='VLIR-UOS supports students from developing countries at Flemish universities. KU Leuven — Belgium\'s largest university, top 50 globally — offers 100+ English-taught master\'s in engineering, life sciences, medicine, social sciences, law, and humanities. Full scholarship covering tuition, ~€900/month, return flight, and insurance.',
                eligibility_criteria='Pakistani citizen and resident — Pakistan is VLIR-UOS eligible. Minimum 70% / 3.0 CGPA. Under 40 years. IELTS 6.5. Cannot hold a European degree or live in Europe. Must return to Pakistan after scholarship.',
                application_link='https://www.kuleuven.be/english/admissions/scholarships/vlir-uos',
            ),
            # ══ FRANCE ════════════════════════════════════════════════════════
            dict(
                title='Eiffel Excellence Scholarship 2027',
                university_name='Grandes Écoles, Sciences Po, HEC Paris, École Polytechnique',
                country='France', degree_level='master',
                required_cgpa=3.5, required_percentage=85.0, ielts_required=6.5,
                scholarship_amount='€1,181/month + International Travel + Health Insurance',
                application_deadline=date(2027, 1, 8), seats_available=400,
                description='French Ministry scholarship attracting top international students. Targets master\'s in engineering, exact sciences, law, economics, and medicine. Monthly grant €1,181 for the full programme. France is home to some of the world\'s most prestigious institutions. Must be NOMINATED by a French institution — proactively contact their international offices.',
                eligibility_criteria='Non-French nationality. Under 30 at application. Top 10-15% of class — minimum 85% / 3.5 CGPA. IELTS 6.5. Must be NOMINATED by a French higher education institution. Cannot have previously received Eiffel Scholarship.',
                application_link='https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence',
            ),
            # ══ DENMARK ═══════════════════════════════════════════════════════
            dict(
                title='University of Copenhagen Scholarship 2027',
                university_name='University of Copenhagen (UCPH)',
                country='Denmark', degree_level='master',
                required_cgpa=3.0, required_percentage=72.0, ielts_required=6.5,
                scholarship_amount='Full Tuition Waiver (~DKK 100,000–160,000/year)',
                application_deadline=date(2027, 1, 15), seats_available=30,
                description='UCPH (founded 1479, ranked #121 globally) offers tuition fee exemptions to highly qualified non-EU/EEA master\'s students. Strong in life sciences, pharmaceutical sciences, law, and humanities. Copenhagen consistently ranked the world\'s most liveable city — safe, English-friendly, and innovation-driven.',
                eligibility_criteria='Non-EU/EEA nationality — Pakistani students eligible. Applying to English-taught master\'s at UCPH. Minimum 72% / 3.0 CGPA. IELTS 6.5, no band below 6.0. Application submitted simultaneously with master\'s programme application.',
                application_link='https://studies.ku.dk/masters/scholarships/',
            ),
            # ══ IRELAND ═══════════════════════════════════════════════════════
            dict(
                title='Government of Ireland International Scholarship 2027',
                university_name='Trinity College Dublin, UCD, University of Galway & others',
                country='Ireland', degree_level='master',
                required_cgpa=3.2, required_percentage=75.0, ielts_required=6.5,
                scholarship_amount='€10,000 per year (Living + Academic Costs)',
                application_deadline=date(2027, 2, 28), seats_available=60,
                description='Irish government scholarship for high-achieving non-EU/EEA students at Irish universities. Ireland is the only English-speaking EU country — excellent gateway to European and global careers. Home to Trinity College Dublin (ranked top 100 globally) and strong tech industry (Google, Meta, Apple European HQs). €10,000 annual award covers living and academic costs.',
                eligibility_criteria='Non-EU/EEA citizen — Pakistani students fully eligible. Minimum 75% / 3.2 CGPA. IELTS 6.5. Accepted to full-time programme at eligible Irish institution.',
                application_link='https://hea.ie/funding-governance-performance/funding/student-finance/gov-of-ireland-international-education-scholarship/',
            ),
            # ══ NORWAY ════════════════════════════════════════════════════════
            dict(
                title='University of Oslo PhD Fellowship 2027',
                university_name='University of Oslo (UiO)',
                country='Norway', degree_level='phd',
                required_cgpa=3.5, required_percentage=80.0, ielts_required=6.5,
                scholarship_amount='NOK 532,200/year (~$49,000) — Salaried PhD Position',
                application_deadline=date(2026, 12, 1), seats_available=40,
                description='UiO (ranked #119 globally) PhD fellowships are salaried positions — not just scholarships. PhD Fellows receive full Norwegian salary (NOK 532,200/year ≈ $49,000), pension, and full social benefits. Norway has zero tuition fees for everyone. Strong in computer science, natural sciences, medicine, law, and humanities. Norway offers the world\'s highest living standards.',
                eligibility_criteria='Any nationality welcome. Master\'s degree with minimum 80% / 3.5 CGPA. IELTS 6.5. Strong research proposal and contact with a UiO supervisor required. PhD positions are 3-year employment contracts. No age limit.',
                application_link='https://www.uio.no/english/research/phd/',
            ),
            # ══ AUSTRIA ═══════════════════════════════════════════════════════
            dict(
                title='OeAD Austrian Government Scholarship 2027',
                university_name='University of Vienna, TU Vienna, Graz, Salzburg, Innsbruck',
                country='Austria', degree_level='master',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=6.0,
                scholarship_amount='€1,350/month + Tuition Supplement + Travel',
                application_deadline=date(2027, 1, 31), seats_available=25,
                description='OeAD administers Austrian Government Scholarships for graduate students from developing countries. Austria has zero tuition fees at public universities for OeAD scholarship holders. €1,350/month covers living costs comfortably. Austria is home to the University of Vienna (founded 1365), TU Vienna, and one of Europe\'s highest qualities of life.',
                eligibility_criteria='Pakistani citizen — Pakistan is OeAD eligible. Minimum 70% / 3.0 CGPA. IELTS 6.0 or German B2. Under 35 years. Letter of acceptance from an Austrian university required.',
                application_link='https://oead.at/en/to-austria/grants-and-scholarships/',
            ),
            # ══ FINLAND ═══════════════════════════════════════════════════════
            dict(
                title='University of Helsinki Scholarship Programme 2027',
                university_name='University of Helsinki',
                country='Finland', degree_level='master',
                required_cgpa=3.2, required_percentage=75.0, ielts_required=6.5,
                scholarship_amount='100% or 50% Tuition Waiver + Optional €10,000 Living Grant',
                application_deadline=date(2027, 1, 22), seats_available=50,
                description='University of Helsinki (ranked #107 globally) scholarship for non-EU/EEA master\'s students demonstrating exceptional academic merit. 100% tuition waiver recipients also get €10,000 living grant. Finland consistently ranks as the world\'s happiest country. Strong programmes in data science, life sciences, humanities, social sciences, and education.',
                eligibility_criteria='Non-EU/EEA nationality — Pakistani students eligible. Applying to English-taught master\'s at University of Helsinki. Minimum 75% / 3.2 CGPA. IELTS 6.5. Scholarship application submitted simultaneously with master\'s application.',
                application_link='https://www.helsinki.fi/en/admissions-and-education/apply-bachelors-and-masters-programmes/tuition-fees-and-scholarships',
            ),
            # ══ ITALY ═════════════════════════════════════════════════════════
            dict(
                title='University of Bologna Study Grants 2026-27',
                university_name='Università di Bologna (Est. 1088 — World\'s Oldest University)',
                country='Italy', degree_level='bachelor',
                required_cgpa=2.5, required_percentage=65.0, ielts_required=6.0,
                scholarship_amount='Up to €11,059/year (Tuition Waiver + Living Grant)',
                application_deadline=date(2026, 8, 22), seats_available=200,
                description='World\'s oldest university (founded 1088, ranked #168 globally) offers Study Grants to international students. Covers tuition fees and provides a living allowance assessed on merit and financial need. Bologna has 70+ English-taught programmes. Italy has Europe\'s lowest student living costs. Available for both bachelor\'s and master\'s programmes.',
                eligibility_criteria='Enrolled or enrolling at University of Bologna. Non-Italian citizen. Minimum 65% / 2.5 CGPA. IELTS 6.0 for English-taught programmes. Income assessment via ER.GO regional authority required.',
                application_link='https://www.unibo.it/en/services-and-opportunities/study-grants-and-subsidies/study-grants',
            ),
            # ══ USA ═══════════════════════════════════════════════════════════
            dict(
                title='Fulbright Foreign Student Program 2027-28',
                university_name='Top U.S. Universities (IIE-administered)',
                country='USA', degree_level='master',
                required_cgpa=3.0, required_percentage=70.0, ielts_required=6.5,
                scholarship_amount='Full Tuition + $2,000/month Stipend + Airfare + Health Insurance',
                application_deadline=date(2026, 10, 15), seats_available=40,
                description='US Government flagship scholarship administered by USEFP in Pakistan. Enables Pakistani graduates to pursue master\'s at top US universities. Full tuition, generous monthly stipend, round-trip airfare, health insurance, and cultural activities. Pakistan is one of the highest Fulbright recipient countries globally. Fields: STEM, social sciences, business, arts, public policy.',
                eligibility_criteria='Pakistani citizen residing in Pakistan. Minimum 3.0 CGPA / 70%. IELTS 6.5 or TOEFL iBT 79. Under 40 for master\'s. No US citizenship or permanent residency. Must return to Pakistan after programme completion.',
                application_link='https://pk.usembassy.gov/education-culture/fulbright-program/fulbright-foreign-student-program/',
            ),
            # ══ CANADA ════════════════════════════════════════════════════════
            dict(
                title='Lester B. Pearson International Scholarship 2027',
                university_name='University of Toronto (Ranked #25 Globally)',
                country='Canada', degree_level='bachelor',
                required_cgpa=3.8, required_percentage=90.0, ielts_required=6.5,
                scholarship_amount='Full Tuition + Books + Residence = ~CAD $60,000/year for 4 Years',
                application_deadline=date(2026, 11, 4), seats_available=37,
                description='One of the world\'s most prestigious undergraduate scholarships. Only 37 students worldwide receive this annually. Covers full tuition, books, incidental fees, and full residence for 4 years. Recognises exceptional academic achievement and leadership. University of Toronto is Canada\'s #1 university, ranked #25 globally.',
                eligibility_criteria='International student (non-Canadian). Currently in final year of secondary school (not yet at university). Top 5%, 90%+ academic record. IELTS 6.5. Must be NOMINATED by your secondary school — principal nominates 1 student. Nomination deadline: November 4, 2026.',
                application_link='https://future.utoronto.ca/pearson/',
            ),
        ]

        for s in scholarships:
            Scholarship.objects.create(**s)
            self.stdout.write(f"  ✓ [{s['degree_level'].upper():8}] [{s['country']:15}] {s['title'][:50]}")

        self.stdout.write(self.style.SUCCESS(f'\n✅ {len(scholarships)} scholarships seeded (all deadlines 2026-2027)'))
