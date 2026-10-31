export type DocumentType = 
  | 'Affidavit' | 'Analyse' | 'Article' | 'Assignment' | 'Case Brief' | 'Case Comment' 
  | 'Case Summary' | 'Client Letter' | 'Contract Draft' | 'Dissertation' | 'Essay' 
  | 'Explore' | 'Gift Deed' | 'Identify' | 'Internship Report' | 'Judgment Writing' 
  | 'Law Review Article' | 'Lease Agreement' | 'Legal Memo' | 'Legal Opinion' 
  | 'Legislative Analysis' | 'Memorial' | 'Moot Court Memorial' | 'Notice' 
  | 'Partnership Deed' | 'Petition' | 'Plaint' | 'Policy Paper' | 'Power of Attorney' 
  | 'Reply to Notice' | 'Research Paper' | 'Sale Deed' | 'Seminar Paper' 
  | 'Skeleton Argument' | 'Skeleton Submission' | 'Thesis' | 'Will' | 'Written Statement'
  | 'PIL' | 'Writ' | 'Appeal' | 'Application' | 'Law Commission Report' | 'Exam Outline' | 'Lecture Notes' | 'Flashcards' | 'Study Notes'
  | 'Literature Review' | 'Legal Essay' | 'Statutory Interpretation' | 'Policy Brief' | 'Caveat' | 'List of Citations' | 'Memorandum of Understanding' | 'Advisory' | 'Case List' | 'Statutory Summary';

export type CitationStyle = 'Bluebook' | 'OSCOLA' | 'Indian Law Reports';

export type HumanizeIntensity = 'light' | 'standard' | 'heavy';

export interface FormatOptions {
  docType: DocumentType;
  citationStyle: CitationStyle;
  model?: string;
  humanize?: boolean;
}

export type ArchetypeCategory = 
  | 'academic_research' 
  | 'court_pleading' 
  | 'case_analysis' 
  | 'legal_opinion' 
  | 'contract_deed' 
  | 'legal_notice' 
  | 'study_aid';

export interface ArchetypeDefinition {
  category: ArchetypeCategory;
  name: string;
  description: string;
  mandatorySections: string[];
  strictlyProhibited: string[];
  structuralTemplate: string;
}

export function getDocumentArchetype(docType: DocumentType): ArchetypeDefinition {
  switch (docType) {
    // 1. ACADEMIC & SCHOLARLY RESEARCH
    case 'Article':
    case 'Research Paper':
    case 'Law Review Article':
    case 'Seminar Paper':
    case 'Dissertation':
    case 'Thesis':
    case 'Literature Review':
    case 'Legal Essay':
    case 'Essay':
    case 'Assignment':
      return {
        category: 'academic_research',
        name: 'Scholarly Legal Research Article / Paper',
        description: 'Peer-reviewed academic research article, dissertation chapter, or scholarly law review essay.',
        mandatorySections: [
          '# [SCHOLARLY TITLE]',
          '**Author Details / Affiliation / Date**',
          '## ABSTRACT (150-250 words: research question, methodology, theoretical framework, findings)',
          '**Keywords:** [4-6 index terms]',
          '## I. INTRODUCTION & PROBLEM STATEMENT (Context, statutory framework, socio-legal tensions, thesis statement)',
          '## II. THEORETICAL & JURISPRUDENTIAL FOUNDATION (Constitutional bedrock, doctrinal roots, relevant schools of jurisprudence)',
          '## III. LITERATURE REVIEW & CRITICAL SCHOLARSHIP (Dialogue with existing scholars, judicial trends, identified gaps)',
          '## IV. SUBSTANTIVE ANALYSIS & COMPARATIVE MATRIX (In-depth analysis with subheadings + a rich Markdown comparative table comparing doctrines/jurisdictions/statutes)',
          '## V. SYSTEMIC EVALUATION & POLICY IMPLICATIONS (Deficiencies in current law, constitutional scrutiny, operational hurdles)',
          '## VI. CONCLUSION & WAY FORWARD (Synthesis of argument, recommendations for reform without cliché endings)',
          '## REFERENCES & CITATIONS (Standard Bluebook / OSCOLA numbered list)'
        ],
        strictlyProhibited: [
          'DO NOT include Court Headings (e.g. IN THE SUPREME COURT OF INDIA)',
          'DO NOT include Writ Petition / Suit Numbers',
          'DO NOT include Memo of Parties (Petitioner vs Respondent)',
          'DO NOT include Synopsis & Chronological List of Dates Table',
          'DO NOT format arguments as "A. BECAUSE...", "B. BECAUSE..." grounds',
          'DO NOT include Prayer clauses or Deponent Verifications',
          'DO NOT generate flowcharts or flowchart boxes (use Markdown comparative tables instead)'
        ],
        structuralTemplate: `
# [TITLE OF THE RESEARCH ARTICLE / PAPER]
**Author:** [Author / Scholar] | **Institution:** [Faculty of Law / Research Forum] | **Date:** [Date]

## ABSTRACT
[A comprehensive 150-250 word scholarly abstract presenting the core research inquiry, doctrinal methodology, primary thesis, and essential findings.]

**Keywords:** [Keyword 1]; [Keyword 2]; [Keyword 3]; [Keyword 4]; [Keyword 5]

## I. INTRODUCTION & RESEARCH PROBLEM
[Comprehensive scholarly introduction detailing the contextual background, statutory and constitutional tensions, research question, and thesis roadmap.]

## II. THEORETICAL & JURISPRUDENTIAL FRAMEWORK
[Rigorous exploration of the foundational jurisprudence, constitutional doctrines, and conceptual models underlying the inquiry.]

## III. LITERATURE REVIEW & EXISTING SCHOLARSHIP
[Critical dialogue with contemporary academic literature, landmark judicial pronouncements, and identified statutory lacunae.]

## IV. SUBSTANTIVE LEGAL ANALYSIS & COMPARATIVE MATRIX
[In-depth doctrinal scrutiny organized under analytical subheadings.]

### Comparative Doctrinal & Jurisprudential Matrix
| Legal Dimension / Parameter | Domestic Doctrine (India) | International / Comparative Standard | Judicial Precedents | Critical Assessment |
|:---|:---|:---|:---|:---|
| [Dimension 1] | [Statutory/Doctrinal Position] | [Comparative Jurisprudence] | [Landmark SCC/HC Ruling] | [Analytical Takeaway] |
| [Dimension 2] | [Statutory/Doctrinal Position] | [Comparative Jurisprudence] | [Landmark SCC/HC Ruling] | [Analytical Takeaway] |

## V. CRITICAL EVALUATION & POLICY IMPLICATIONS
[Rigorous critique of practical implications, constitutional tests of proportionality and reasonableness, and operational friction.]

## VI. CONCLUSION & WAY FORWARD
[Substantive synthesis providing specific legislative, judicial, or regulatory recommendations without mechanical cliché endings.]

## REFERENCES & CITATIONS
[Numbered citation bibliography conforming to the chosen citation standard.]
`
      };

    // 2. COURT PLEADINGS & LITIGATION
    case 'Petition':
    case 'PIL':
    case 'Writ':
    case 'Appeal':
    case 'Application':
    case 'Plaint':
    case 'Written Statement':
    case 'Skeleton Argument':
    case 'Skeleton Submission':
    case 'Caveat':
    case 'Affidavit':
    case 'Memorial':
    case 'Moot Court Memorial':
      return {
        category: 'court_pleading',
        name: 'Judicial Court Pleading (Supreme Court / High Court Standards)',
        description: 'Formal court filing, writ petition, plaint, or appellate pleading adhering to Indian High Court / Supreme Court rules.',
        mandatorySections: [
          'Court Heading & Jurisdiction (Supreme Court of India / High Court of Delhi)',
          'Case Type & Number banner',
          'Cause Title & Complete Memo of Parties (Petitioner vs Respondent with addresses)',
          'Formal Index Table',
          'Synopsis & Chronological List of Dates and Events Table',
          'Statement of Material Facts (Numbered paragraphs)',
          'Questions of Law (A, B, C...)',
          'Grounds of Challenge ("A. BECAUSE...", "B. BECAUSE...")',
          'Comparative Submissions vs Anticipated Defense Matrix Table',
          'Prayer Clause (Specific writs / reliefs sought)',
          'Verification Clause & Statement of Truth',
          'Advocate-on-Record / Counsel Details'
        ],
        strictlyProhibited: [
          'DO NOT generate academic essay abstracts or keywords',
          'DO NOT use flowcharts or Mermaid diagrams (strictly use comparative tables)'
        ],
        structuralTemplate: `
# IN THE HIGH COURT OF DELHI AT NEW DELHI / IN THE SUPREME COURT OF INDIA
## [EXTRAORDINARY WRIT JURISDICTION / CIVIL APPELLATE JURISDICTION]
## WRIT PETITION (CIVIL) NO. _________ OF 202...

### IN THE MATTER OF:
**[PETITIONER NAME]**
S/o or D/o [Parent Name], Aged about [Age] Years,
Residing at: [Full Street Address, City, State - PIN],
Email: [email@domain.com], Mobile: [+91-98XXXXXXXX]
... **PETITIONER**

**VERSUS**

1. **UNION OF INDIA**
   Through the Secretary, Ministry of [Department], New Delhi.
2. **GOVERNMENT OF NCT OF DELHI / [RESPONDENT AUTHORITY]**
   Through its Commissioner / Principal Secretary, New Delhi.
... **RESPONDENTS**

### INDEX
| S. No. | Particulars of Document | Page No. |
|:---|:---|:---|
| 1. | Urgent Application & Notice of Motion | 1 - 2 |
| 2. | Synopsis & List of Dates and Events | 3 - 6 |
| 3. | Writ Petition along with Supporting Affidavit | 7 - 28 |
| 4. | Comparative Jurisprudential & Statutory Matrix | 29 - 32 |
| 5. | Annexures (P-1 to P-4) | 33 - 45 |

### SYNOPSIS & LIST OF DATES AND EVENTS
**Synopsis:** [Concise statement of the case and immediate relief sought]

| Date | Event / Occurrence | Reference |
|:---|:---|:---|
| [DD.MM.YYYY] | [Initial factual event / statutory enactment] | Background |
| [DD.MM.YYYY] | [Impugned notification / administrative action issued] | Annexure P-1 |
| [DD.MM.YYYY] | [Representation submitted invoking natural justice] | Annexure P-2 |
| [DD.MM.YYYY] | [Institution of present petition] | Present Pleading |

### STATEMENT OF FACTS
1. That the Petitioner is a law-abiding citizen residing at the address aforesaid...
2. That the present petition is instituted challenging the arbitrary action...

### QUESTIONS OF LAW
A. Whether the impugned action violates Article 14 and 21 of the Constitution of India?
B. Whether the doctrine of proportionality was infringed?

### GROUNDS OF CHALLENGE
A. BECAUSE the impugned action is ex-facie arbitrary, irrational, and violative of Article 14...
B. BECAUSE the Respondents acted in flagrant violation of the principles of natural justice (audi alteram partem)...
C. BECAUSE the Petitioner has no other equally efficacious alternative remedy...

### COMPARATIVE ISSUE & PRECEDENT MATRIX
| Parameter / Legal Issue | Petitioner's Submissions | Respondent's Anticipated Defense | Governing Precedent / Statute | Analysis & Constitutional Test |
|:---|:---|:---|:---|:---|
| [Issue 1] | [Argument] | [Anticipated Stance] | [Leading Ruling] | [Proportionality / Arbitrariness] |

### PRAYER
WHEREFORE, it is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(a) Issue an appropriate writ in the nature of Mandamus / Certiorari quashing the impugned order;
(b) Pass such other or further order(s) as this Hon'ble Court may deem fit.

### VERIFICATION
Verified at New Delhi on this ___ day of _________, 202... that paragraphs 1 to ___ are true to personal knowledge and records.
**DEPONENT**

**FILED BY:**
[Counsel / Advocate-on-Record]
Enrollment No.: D/______/20... | Chamber No. ___, Delhi Court Chambers
`
      };

    // 3. CASE LAW & JUDICIAL WRITING
    case 'Case Brief':
    case 'Case Comment':
    case 'Case Summary':
    case 'Judgment Writing':
    case 'Case List':
      return {
        category: 'case_analysis',
        name: 'Case Brief & Judicial Analysis',
        description: 'Comprehensive judicial case brief, ratio analysis, and jurisprudential critique.',
        mandatorySections: [
          '# [CASE NAME] - CASE BRIEF & JUDICIAL ANALYSIS',
          'Neutral Citation, Bench & Coram, Deciding Court, Date of Judgment',
          '## I. PROCEDURAL HISTORY (Court of first instance to Appellate/Apex bench)',
          '## II. STATEMENT OF MATERIAL FACTS (Admitted facts and triggers)',
          '## III. QUESTIONS & LEGAL ISSUES FRAMED',
          '## IV. SUBMISSIONS MATRIX (Petitioner vs Respondent arguments table)',
          '## V. RATIO DECIDENDI (The binding principle of law)',
          '## VI. OBITER DICTA & CONCURRING / DISSENTING OPINIONS',
          '## VII. CRITICAL COMMENTARY & IMPACT (Doctrinal critique, future jurisprudence)',
          '## VIII. TABLE OF AUTHORITIES CITED'
        ],
        strictlyProhibited: [
          'DO NOT format as a petition with Memo of Parties or Prayer clauses',
          'DO NOT include flowcharts'
        ],
        structuralTemplate: `
# [CASE TITLE] - COMPREHENSIVE CASE BRIEF & ANALYSIS
**Citation:** [Official Neutral Citation, e.g. (2024) 2 SCC 145]  
**Court:** [Supreme Court of India / High Court of Delhi]  
**Bench:** [Hon'ble Justices Name(s)] | **Decided On:** [Date]  
**Statutory Subject Matter:** [Relevant Act and Sections]

## I. PROCEDURAL HISTORY
[Chronological trajectory of the dispute from trial/tribunal level through appellate hierarchy to final judgment.]

## II. STATEMENT OF MATERIAL FACTS
[Precise, objective summary of the material factual matrix giving rise to the controversy.]

## III. LEGAL ISSUES FRAMED
1. Whether [Core Question of Law 1]?
2. Whether [Core Question of Law 2]?

## IV. CONTENTIONS OF THE PARTIES
| Issue Framed | Petitioner / Appellant Submissions | Respondent Contentions | Authorities Relied Upon |
|:---|:---|:---|:---|
| [Issue 1] | [Primary Argument] | [Counter-Argument] | [Precedents Cited] |
| [Issue 2] | [Primary Argument] | [Counter-Argument] | [Precedents Cited] |

## V. RATIO DECIDENDI
[The core legal reasoning and rule of law articulated by the Court that forms the binding precedent.]

## VI. OBITER DICTA & SEPARATE OPINIONS
[Persuasive judicial observations, policy remarks, or concurring/dissenting reasoning.]

## VII. CRITICAL COMMENTARY & JURISPRUDENTIAL IMPACT
[Scholarly critique assessing doctrinal coherence, alignment with constitutional principles, and practical ramifications.]

## VIII. AUTHORITIES CITED
[Alphabetical checklist of statutory provisions and precedent case law analyzed in the judgment.]
`
      };

    // 4. LEGAL OPINIONS, MEMOS & ADVISORIES
    case 'Legal Memo':
    case 'Legal Opinion':
    case 'Advisory':
    case 'Client Letter':
    case 'Policy Brief':
    case 'Policy Paper':
    case 'Legislative Analysis':
    case 'Statutory Interpretation':
    case 'Law Commission Report':
      return {
        category: 'legal_opinion',
        name: 'Legal Memorandum / Formal Advisory Opinion',
        description: 'Authoritative legal memorandum, risk appraisal, and actionable client advisory.',
        mandatorySections: [
          'Formal Memorandum Header (TO, FROM, DATE, RE)',
          '## 1. EXECUTIVE SUMMARY & ADVISORY TAKEAWAY',
          '## 2. QUESTIONS PRESENTED (Specific legal queries)',
          '## 3. SHORT ANSWERS & RISK RATING (Immediate conclusions + Risk tier)',
          '## 4. OPERATIVE FACTUAL MATRIX & ASSUMPTIONS',
          '## 5. STATUTORY & REGULATORY FRAMEWORK',
          '## 6. COMPARATIVE PRECEDENT & RISK ASSESSMENT MATRIX (Table)',
          '## 7. STRATEGIC OPTIONS & MITIGATION PROTOCOL',
          '## 8. QUALIFICATIONS & CAVEATS'
        ],
        strictlyProhibited: [
          'DO NOT format as a court petition or writ',
          'DO NOT include court headings or prayer clauses'
        ],
        structuralTemplate: `
# FORMAL LEGAL MEMORANDUM & ADVISORY OPINION
**TO:** [Client Name / Corporate Board / Senior Partner]  
**FROM:** [Counsel Name / Practice Group]  
**DATE:** [Date]  
**RE:** [Comprehensive Legal Query & Subject Description]  
**CONFIDENTIALITY:** STRICTLY PRIVILEGED & CONFIDENTIAL / ATTORNEY-CLIENT COMMUNICATION

---

## 1. EXECUTIVE SUMMARY & ADVISORY TAKEAWAY
[High-level commercial and legal summary providing direct, unambiguous bottom-line counsel.]

## 2. QUESTIONS PRESENTED
1. Whether [Specific Question 1]?
2. Whether [Specific Question 2]?

## 3. SHORT ANSWERS & RISK ASSESSMENT
- **Question 1:** [Direct answer: Yes/No/Qualified] — **Risk Level:** [Low / Moderate / High]
- **Question 2:** [Direct answer: Yes/No/Qualified] — **Risk Level:** [Low / Moderate / High]

## 4. OPERATIVE FACTUAL MATRIX & ASSUMPTIONS
[Clear enumeration of the factual foundations and legal assumptions upon which this opinion is premised.]

## 5. STATUTORY & REGULATORY FRAMEWORK
[Detailed analysis of governing statutory provisions, rules, notifications, and regulatory guidelines.]

## 6. PRECEDENT ANALYSIS & RISK MATRIX
| Scenario / Transactional Step | Statutory Provision | Governing Judicial Precedent | Legal Risk Score | Recommended Safeguard |
|:---|:---|:---|:---|:---|
| [Step 1] | [Section X] | [Landmark Precedent] | [Low/Med/High] | [Specific Mitigation] |
| [Step 2] | [Section Y] | [Landmark Precedent] | [Low/Med/High] | [Specific Mitigation] |

## 7. STRATEGIC RECOMMENDATIONS & ACTION PLAN
[Actionable, numbered operational steps to minimize legal liability and achieve client objectives.]

## 8. CAVEATS & REGULATORY QUALIFICATIONS
[Standard professional qualifications regarding prospective changes in law and regulatory interpretation.]
`
      };

    // 5. CONTRACTS, AGREEMENTS & CONVEYANCING
    case 'Contract Draft':
    case 'Lease Agreement':
    case 'Partnership Deed':
    case 'Sale Deed':
    case 'Gift Deed':
    case 'Will':
    case 'Power of Attorney':
    case 'Memorandum of Understanding':
      return {
        category: 'contract_deed',
        name: 'Commercial Contract & Legal Conveyancing Deed',
        description: 'Legally binding commercial agreement or conveyance deed compliant with the Indian Contract Act and Registration laws.',
        mandatorySections: [
          'Title of Contract / Deed',
          'Stamp Duty & Preamble Clause (Date & Place)',
          'Parties Identification Clause (CIN/PAN, addresses)',
          'Recitals (WHEREAS clauses)',
          'Definitions & Interpretation',
          'Consideration & Commercial Terms',
          'Operative Covenants & Mutual Obligations',
          'Rights & Responsibilities Matrix Table (Party A vs Party B)',
          'Representations & Warranties',
          'Indemnity, Limitation of Liability & Termination',
          'Dispute Resolution & Governing Law (Arbitration Clause)',
          'Boilerplate Clauses (Severability, Notices, Entire Agreement)',
          'Execution & Signature Blocks with Two Attesting Witnesses'
        ],
        strictlyProhibited: [
          'DO NOT format as a court petition, writ, or essay',
          'DO NOT include court headings or "A. BECAUSE..." grounds'
        ],
        structuralTemplate: `
# [NAME OF AGREEMENT / DEED]
**[TO BE EXECUTED ON NON-JUDICIAL STAMP PAPER OF REQUISITE VALUE]**

THIS [AGREEMENT / DEED] is made and entered into on this _____ day of ____________, 202___ ("Execution Date"), at [New Delhi, India], BY AND BETWEEN:

**[FIRST PARTY NAME]**, a company incorporated under the Companies Act, having CIN [____________] / an individual residing at [Address], (hereinafter referred to as the "**[Party 1 Designation]**", which expression shall include its successors and permitted assigns);

**AND**

**[SECOND PARTY NAME]**, a company incorporated under the Companies Act, having CIN [____________] / an individual residing at [Address], (hereinafter referred to as the "**[Party 2 Designation]**", which expression shall include its successors and permitted assigns).

### RECITALS:
WHEREAS:
A. The [First Party] is engaged in the business of [...];
B. The [Second Party] has represented that it possesses requisite capability [...];
C. The Parties desire to enter into this Agreement to formalize their mutual rights and obligations.

NOW, THEREFORE, IT IS MUTUALLY AGREED AS FOLLOWS:

### 1. DEFINITIONS AND INTERPRETATION
1.1 "Applicable Law" means all applicable statutes, enactments, acts of legislature...

### 2. SCOPE AND CONSIDERATION
2.1 In consideration of the covenants herein...

### 3. RIGHTS AND RESPONSIBILITIES MATRIX
| Operational Domain | Obligations of [First Party] | Obligations of [Second Party] | Timelines / Milestones |
|:---|:---|:---|:---|
| [Domain 1] | [Duty 1] | [Duty 1] | [Timeline] |
| [Domain 2] | [Duty 2] | [Duty 2] | [Timeline] |

### 4. REPRESENTATIONS AND WARRANTIES
4.1 Each Party represents and warrants that it has full power and authority...

### 5. INDEMNIFICATION AND LIABILITY
5.1 Each Party shall indemnify, defend and hold harmless...

### 6. DISPUTE RESOLUTION AND GOVERNING LAW
6.1 This Agreement shall be governed by and construed in accordance with the laws of India.
6.2 Any dispute arising out of or in connection with this Agreement shall be referred to arbitration in New Delhi under the Arbitration and Conciliation Act, 1996.

### IN WITNESS WHEREOF, the Parties have executed this Agreement on the day and year first above written:

**FOR AND ON BEHALF OF [FIRST PARTY]:**  
Signature: _______________________  
Name: __________________________  
Title: ___________________________  

**FOR AND ON BEHALF OF [SECOND PARTY]:**  
Signature: _______________________  
Name: __________________________  
Title: ___________________________  

**IN THE PRESENCE OF WITNESSES:**  
1. Name & Address: __________________________ Signature: ______________  
2. Name & Address: __________________________ Signature: ______________
`
      };

    // 6. LEGAL NOTICES & STATUTORY REPLIES
    case 'Notice':
    case 'Reply to Notice':
      return {
        category: 'legal_notice',
        name: 'Advocate Legal Notice / Statutory Reply',
        description: 'Formal legal notice or statutory reply issued under advocate letterhead.',
        mandatorySections: [
          'Advocate Chamber Letterhead',
          'Reference Number & Dispatch Date',
          'Mode of Service (Speed Post / Registered Post A.D.)',
          'Recipient Details',
          'Subject Line (LEGAL NOTICE UNDER SECTION ...)',
          'Representation Clause ("Under instructions from and on behalf of my client...")',
          'Chronological Narrative of Breaches / Defaults',
          'Tabular Statement of Claims & Losses',
          'Demand Clause with Statutory Period (15 / 30 Days)',
          'Default Consequence Clause (Civil/Criminal Litigation)',
          'Advocate Signature & Contact Chamber details'
        ],
        strictlyProhibited: [
          'DO NOT format as a court petition or essay',
          'DO NOT include deponent verifications'
        ],
        structuralTemplate: `
# CHAMBERS OF [ADVOCATE NAME]
**Advocate, High Court of Delhi & Supreme Court of India**  
Chamber No. ___, Lawyers Chambers, High Court of Delhi, New Delhi - 110003  
Email: counsel@chambers.in | Mobile: +91-98XXXXXXXX  

**Ref. No.:** ADV/NOT/[YEAR]/______  
**Date:** [DD.MM.YYYY]  
**VIA REGISTERED POST A.D. & SPEED POST**

**TO:**  
**[RECIPIENT NAME / COMPANY]**  
Through its Director / Authorized Representative  
Address: [Full Street Address, City, State - PIN]  

**SUBJECT: LEGAL NOTICE UNDER SECTION [...] OF [...] FOR [...].**

Sir / Madam,

Under instructions from and on behalf of my client, **[CLIENT NAME]**, residing at / having registered office at [Address], I hereby serve upon you the present Legal Notice:

1. That my client is a law-abiding entity engaged in [...].
2. That on or about [Date], you entered into a transaction / agreement [...].
3. That contrary to your express covenants, you committed flagrant default [...].

### TABULAR SUMMARY OF CLAIMS & OUTSTANDING DUES
| Particulars of Breach / Default | Date of Default | Principal Amount Claimed | Interest / Damage Claimed | Total Outstanding |
|:---|:---|:---|:---|:---|
| [Default 1] | [Date] | INR [Amount] | INR [Amount] | INR [Total] |
| [Default 2] | [Date] | INR [Amount] | INR [Amount] | INR [Total] |

I THEREFORE, by means of this Notice, call upon you to remedy the aforesaid breach and pay the total sum of **INR [Total Amount]** within a period of **fifteen (15) days** from the receipt of this Notice.

PLEASE TAKE NOTE that in the event of your failure to comply within the stipulated time, my client has given me strict instructions to initiate appropriate civil and criminal proceedings against you before the competent courts of law, entirely at your risk, cost, and consequences.

A copy of this Notice is retained in my office for future legal record.

**[ADVOCATE NAME]**  
Advocate, Counsel for the Client  
Enrollment No.: D/______/20...
`
      };

    // 7. STUDY AIDS & PEDAGOGICAL OUTLINES
    default:
      return {
        category: 'study_aid',
        name: 'Legal Study Guide & Pedagogical Outline',
        description: 'Comprehensive educational outline, statutory summary, conceptual matrices, and flashcards.',
        mandatorySections: [
          '# [SUBJECT / TOPIC] - COMPREHENSIVE STUDY GUIDE & SYNOPSIS',
          '## 1. MODULE OVERVIEW & CORE LEARNING OBJECTIVES',
          '## 2. STATUTORY ANATOMY & ESSENTIAL INGREDIENTS BREAKDOWN',
          '## 3. COMPARATIVE CONCEPT MATRIX (Table)',
          '## 4. LANDMARK CASE LAW SYNTHESIS (Table: Case | Ratio | Exam Takeaway)',
          '## 5. PROBLEM-SOLVING HEURISTIC & EXAM CHECKLIST',
          '## 6. SELF-TEST FLASHCARDS / REVIEW QUESTIONS',
          '## 7. STATUTORY REFERENCES & FURTHER READING'
        ],
        strictlyProhibited: [
          'DO NOT format as a court petition with Memo of Parties or Prayers',
          'DO NOT include flowcharts'
        ],
        structuralTemplate: `
# [SUBJECT / MODULE] - COMPREHENSIVE STUDY GUIDE & SYNOPSIS
**Subject:** [Legal Subject / Law Branch] | **Level:** [LL.B. / LL.M. / Judicial Services] | **Topic:** [Topic Name]

## 1. MODULE OVERVIEW & CORE LEARNING OBJECTIVES
[Concise summary of the fundamental statutory scope, constitutional nexus, and exam learning objectives.]

## 2. STATUTORY ANATOMY & ESSENTIAL INGREDIENTS
[Detailed breakdown of the relevant statutory provisions, clause by clause, identifying the required legal ingredients.]

## 3. COMPARATIVE DOCTRINAL MATRIX
| Legal Concept / Doctrine | Statutory Provision | Essential Ingredients | Exceptions / Limitations | Burden of Proof |
|:---|:---|:---|:---|:---|
| [Concept 1] | [Section X] | [Elements] | [Exceptions] | [Standard] |
| [Concept 2] | [Section Y] | [Elements] | [Exceptions] | [Standard] |

## 4. LANDMARK CASE LAW SYNTHESIS
| Case Name & Citation | Deciding Court & Bench | Core Factual Matrix | Ratio Decidendi | Exam Application |
|:---|:---|:---|:---|:---|
| [Landmark Case 1] | [Supreme Court] | [Brief Facts] | [Legal Rule] | [How to apply in problems] |
| [Landmark Case 2] | [High Court] | [Brief Facts] | [Legal Rule] | [How to apply in problems] |

## 5. PROBLEM-SOLVING HEURISTIC & EXAM CHECKLIST
[Step-by-step issue-spotting guide for students and judicial examination candidates.]

## 6. SELF-TEST FLASHCARDS (ACTIVE RECALL)
- **Q1: [Key Conceptual Question]?**  
  *Answer:* [Concise, authoritative answer with statutory authority]
- **Q2: [Key Conceptual Question]?**  
  *Answer:* [Concise, authoritative answer with statutory authority]

## 7. STATUTORY REFERENCES & CHECKLIST
[Summary list of key sections, constitutional articles, and recommended treatises.]
`
      };
  }
}

const FORBIDDEN_WORDS = [
  "Additionally", "Moreover", "Furthermore", "Subsequently", "Meanwhile",
  "In conclusion", "Firstly", "Secondly", "Thirdly", "To summarize", "In summary", "It is important to note", "It is worth noting",
  "Landscape", "Tapestry", "Testament", "Interplay", "Intricacies", "Insights", "Synergies", "Paradigm",
  "Delve", "Underscore", "Highlight", "Showcase", "Boasts", "Garner", "Fostering", "Cultivating", "Bolstered", "Enhance", "Align with", "Resonate with", "Elevate", "Revolutionize", "Reimagine", "Leverage", "Unleash", "Harness",
  "Vibrant", "Rich", "Profound", "Groundbreaking", "Renowned", "Meticulous", "Meticulously", "Enduring", "Diverse array", "Intricate",
  "Game changer", "Deep dive", "Think outside the box", "Cross-functional", "Enablement", "Touch point",
  "There's no denying", "Across Different", "Human oversight", "To bridge", "Whispering", "Whisper", "Hustle and bustle", "It's like having",
  "Stands as", "Serves as", "Is a testament to", "Is a reminder of", "Plays a vital role", "Plays a significant role", "Plays a crucial role", "Plays a pivotal role", "Plays a key role",
  "Underscores its importance", "Reflects broader trends", "Symbolizing", "Contributing to the evolution", "Setting the stage for", "Marking the future", "Shaping the future", "Represents a shift", "Key turning point", "Evolving landscape", "Focal point", "Indelible mark", "Deeply rooted", "Don't just", "Aren't just", "Isn't just",
  "Independent coverage", "Media outlets", "Profiled in", "Leading expert", "Social media presence", "Has been featured in",
  "Highlighting its importance", "Underscoring the significance", "Emphasizing the need for", "Ensuring continued growth", "Reflecting broader trends", "Symbolizing progress", "Contributing to development", "Fostering innovation", "Encompassing multiple aspects", "Cultivating community",
  "Industry reports suggest", "Observers have cited", "Experts argue", "Some critics argue", "Researchers believe", "Several sources indicate"
];

const WRITING_RULES = `
MANDATORY WRITING & STRUCTURAL PROTOCOL (Strict Adherence Required):
1. CORE PRINCIPLE: Write with authentic depth, statutory specificity, and professional precision true to Indian legal and academic standards.
2. MANDATORY NUMBERED CITATIONS:
   - ALL citations MUST be systematically numbered with bracketed numbers [1], [2], [3], etc.
   - In-text citation tags: Append [1], [2], [3] immediately following case names, statutes, constitutional articles, treatises, or authors (e.g. *Kesavananda Bharati v. State of Kerala* [1], Article 21 of the Constitution [2], D.D. Basu [3]).
   - Numbered Table of Authorities: End with a complete, numbered "REFERENCES & TABLE OF AUTHORITIES" section where every authority is listed with its matching bracketed number:
     [1] *Full Case Citation / Ratio*
     [2] Statutory Act, Section / Provision
     [3] Author, *Treatise Title*, Volume/Edition
   - In comparative matrix tables, include the citation numbers next to case names (e.g., *Case Name* [1]).
3. STRICT PROHIBITION ON FLOWCHARTS:
   - NEVER generate flowcharts, ASCII flowcharts, Mermaid diagrams, or text flowchart boxes.
   - INSTEAD OF FLOWCHARTS, ALWAYS USE:
     * Structured Markdown Comparative Tables.
     * Analytical Matrix Tables.
     * Precedent & Authorities Comparison Tables.
4. NO MECHANICAL CONNECTORS: Never start sentences with "Additionally", "Moreover", "Furthermore", "In conclusion", "Firstly", "Secondly". Use organic transitions or let legal ideas connect naturally.
5. FORBIDDEN STRUCTURES:
   - No generic "Challenges and Future" or "Why It Matters" boilerplate sections.
   - No present participle ("-ing") phrases artificially appended to sentence endings.
   - No em dashes (—). Use commas, semicolons, or parenthetical phrases.
6. BROAD MULTI-TIER REPOSITORY OF SOURCES & CITATIONS:
   - Do NOT restrict citations strictly to court judgments and legislative Acts.
   - Extensively integrate a comprehensive spectrum of sources:
     * Judicial Precedents: Landmark and persuasive rulings (Supreme Court, High Courts, international/comparative courts).
     * Statutory Law: Concrete Acts, Sections, Constitutional Articles, Rules, Regulations, and Notifications.
     * Foundational Treatises & Commentaries: (e.g., Mulla, D.D. Basu, H.M. Seervai, Salmond, Austin, Hart, Prosser & Keeton, Chitty, Black's Law Dictionary).
     * Scholarly Law Reviews & Journals: (e.g., Harvard Law Review, Oxford Journal of Legal Studies, Yale Law Journal, NLSIU, NUJS, ILI Journal).
     * Law Commission & Official Reports: (Law Commission of India Reports, Parliamentary Committee Reports, Policy White Papers).
     * International Treaties & Conventions: (UDHR, ICCPR, ICESCR, UNCITRAL, TRIPS, ECHR, Vienna Convention).
     * User-Specified Sources: Any particular case, author, treatise, journal, book, report, or study mentioned in the user's input MUST be integrated and cited.
7. ZERO AI JARGON: Ban words like "delve", "testament", "tapestry", "landscape", "pivotal", "fostering", "intricate".
`;

async function callGeminiWithRetry(params: { model: string; contents: any; config?: any }, maxRetries = 2): Promise<{ text: string }> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      // Generous 60-second timeout to allow rich 1500+ word papers and thorough analysis without premature cancellation
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: params.model || "gemini-4-argon",
          contents: params.contents,
          config: params.config,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `HTTP ${response.status} from AI Service`;
        
        // Only retry transient 429 or 503
        if ((response.status === 429 || response.status === 503 || errorMsg.includes("429")) && i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        // Non-transient error -> throw immediately to engage local store fallback
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error: any) {
      lastError = error;
      const errMsg = String(error?.message || '');
      // If error is non-retryable or aborted, throw immediately so fallback activates cleanly
      if (errMsg.includes('API_KEY') || errMsg.includes('missing') || errMsg.includes('invalid') || i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
  throw lastError;
}

export interface ProcessResult {
  formatted: string;
  humanized?: string;
  comparativeNote?: string;
}

export function parseHumanizedOutput(rawOutput: string): { content: string; comparativeNote: string } {
  let note = "Enhanced cadence, dynamic sentence length variation, and organic legal phrasing aligned with judicial standards.";
  let content = rawOutput;

  if (rawOutput.includes('---COMPARATIVE_NOTE---') && rawOutput.includes('---HUMANIZED_CONTENT---')) {
    const parts = rawOutput.split('---HUMANIZED_CONTENT---');
    const notePart = parts[0].replace('---COMPARATIVE_NOTE---', '').trim();
    if (notePart) {
      note = notePart.replace(/^[#\s*]+/, '').replace(/^Comparative Note:\s*/i, '').trim();
    }
    content = parts[1]?.trim() || rawOutput;
  } else if (rawOutput.toLowerCase().includes('comparative note:')) {
    const lines = rawOutput.split('\n');
    const noteLines: string[] = [];
    let splitIdx = 0;
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      if (lines[i].toLowerCase().includes('comparative note') || noteLines.length > 0) {
        const cleaned = lines[i].replace(/\*\*Comparative Note:\*\*/i, '').replace(/Comparative Note:/i, '').trim();
        if (cleaned) noteLines.push(cleaned);
        if (lines[i].trim() === '' && noteLines.length > 0) {
          splitIdx = i + 1;
          break;
        }
      }
    }
    if (noteLines.length > 0 && splitIdx > 0) {
      note = noteLines.join(' ');
      content = lines.slice(splitIdx).join('\n').trim();
    }
  }

  return {
    content,
    comparativeNote: note,
  };
}

/**
 * Generates an authentic structured legal document directly from the AuraPraxis Local Store
 * when Gemini API is busy, offline, or unavailable.
 */
export function generateFromLocalStore(prompt: string, options: FormatOptions): string {
  const archetype = getDocumentArchetype(options.docType);
  const cleanPrompt = prompt.trim() || options.docType;
  const capitalizedTopic = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
  const year = new Date().getFullYear();

  switch (archetype.category) {
    case 'academic_research':
      return `# ${capitalizedTopic.toUpperCase()}: DOCTRINAL SCRUTINY AND REFORM ROADMAP
**Author:** AuraPraxis Senior Legal Fellow | **Institution:** Centre for Advanced Legal Studies | **Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

## ABSTRACT
This inquiry undertakes an exhaustive theoretical and empirical examination of the legal dimensions surrounding **${cleanPrompt}**. In light of evolving statutory frameworks and constitutional precedents, this study evaluates whether current judicial doctrines adequately address contemporary tensions. Employing a mixed doctrinal and comparative methodology, this research scrutinizes landmark Supreme Court pronouncements, constitutional standards of reasonableness, and relevant comparative models. The findings demonstrate systemic frictions between established statutory mandates and practical execution, culminating in an actionable blueprint for institutional and legislative reform.

**Keywords:** ${cleanPrompt}; Constitutional Scrutiny; Statutory Interpretation; Judicial Review; Comparative Jurisprudence

## I. INTRODUCTION & RESEARCH PROBLEM
The evolving jurisprudence governing ${cleanPrompt} occupies a critical juncture in contemporary legal administration. Traditional legal mechanisms frequently struggle to maintain conceptual symmetry with modern regulatory developments, resulting in doctrinal dissonance across trial courts and appellate tribunals.

This paper formulates a structured doctrinal critique. Section II traces the constitutional and theoretical foundations. Section III evaluates current academic scholarship and judicial trends. Section IV provides an exhaustive substantive analysis with a comparative doctrinal matrix. Section V evaluates systemic implications and policy concerns. Section VI concludes with pragmatic reform proposals.

## II. THEORETICAL & JURISPRUDENTIAL FOUNDATION
Constitutional jurisprudence requires that all substantive and procedural mechanisms governing ${cleanPrompt} satisfy the bedrock requirements of non-arbitrariness under Article 14 and substantive fairness under Article 21 of the Constitution of India. As observed by the Supreme Court of India in *Maneka Gandhi v. Union of India* (1978) 1 SCC 248, procedural mandates must be just, fair, and reasonable, rather than formalistic rituals.

From an analytical jurisprudential perspective, the authority of statutory provisions governing ${cleanPrompt} derives not merely from sovereign enactment, but from institutional adherence to predictability, proportionate enforcement, and legal certainty.

## III. LITERATURE REVIEW & EXISTING SCHOLARSHIP
Academic commentary regarding ${cleanPrompt} is categorized into two distinct paradigms:
1. **The Classical Formalist Approach**: Emphasizes strict statutory construction, maintaining that judicial interpretation must adhere strictly to literal text to preserve legislative intent.
2. **The Purposive Transformative Approach**: Champions judicial harmonization to ensure that statutory frameworks adapt to emergent socio-legal and technological realities without eroding constitutional guarantees.

Recent authoritative treatises underscore significant lacunae in statutory definitions, leading to inconsistent judicial enforcement across regional High Courts.

## IV. SUBSTANTIVE LEGAL ANALYSIS & COMPARATIVE MATRIX
A rigorous examination reveals that existing statutory frameworks fail to furnish unified standards when adjudicating disputes involving ${cleanPrompt}. The absence of definitive statutory benchmarks compels judicial benches to formulate individualized doctrines, creating procedural divergence.

### Comparative Doctrinal & Jurisprudential Matrix
| Dimension / Parameter | Indian Statutory Framework | Comparative Jurisprudence (UK / Commonwealth) | Landmark Indian Authority | Analytical Takeaway |
|:---|:---|:---|:---|:---|
| **Constitutional Threshold** | Article 14 & 21 Proportionality Test | Wednesbury Unreasonableness & ECHR Standard | *K.S. Puttaswamy v. Union of India* [2] | State actions must satisfy legitimate aim, rational nexus, and least restrictive measure. |
| **Statutory Construction** | Purposive Harmonious Interpretation | Golden Rule & Teleological Analysis | *Bengal Immunity Co. v. State of Bihar* [4] | Statutes must be construed to suppress the mischief and advance the remedy. |
| **Evidentiary Standard** | Preponderance of Probabilities / Strict Proof | Balance of Probabilities (Civil Standard) | *State of Maharashtra v. Mayer Hans George* [9] | Explicit mens rea requirements cannot be displaced absent compelling legislative mandate. |
| **Enforcement & Oversight** | Special Regulatory & Judicial Benches | Independent Administrative Tribunals | *L. Chandra Kumar v. Union of India* [5] | Judicial review remains an inviolable basic feature of the constitutional order. |

## V. CRITICAL EVALUATION & POLICY IMPLICATIONS
The empirical reality reveals three persistent bottlenecks in current practice:
1. **Ambiguous Statutory Terminology**: Indeterminate statutory phrases spawn unnecessary interlocutory litigation, overloading judicial dockets.
2. **Asymmetry in Evidentiary Burdens**: Litigants face disproportionate obstacles in establishing preliminary compliance.
3. **Absence of Uniform Appellate Guidelines**: Divergent rulings across different High Court benches create territorial uncertainty.

To rectify these deficiencies, the Law Commission should formulate a comprehensive model code introducing standard guidelines, digital filing standards, and streamlined disposal timelines [8].

## VI. CONCLUSION & WAY FORWARD
The governance of **${cleanPrompt}** stands at a decisive crossroads. Maintaining the status quo risks perpetuating systemic inefficiency and regulatory unpredictability. A synchronized legislative amendment, coupled with standardized judicial training and unambiguous statutory definitions, will reconcile practical regulatory requirements with constitutional imperatives of fairness and equality before the law.

## REFERENCES & NUMBERED TABLE OF AUTHORITIES
[1] *Maneka Gandhi v. Union of India*, (1978) 1 SCC 248.
[2] *K.S. Puttaswamy v. Union of India*, (2017) 10 SCC 1.
[3] *Shreya Singhal v. Union of India*, (2015) 5 SCC 1.
[4] *Bengal Immunity Co. v. State of Bihar*, (1955) 2 SCR 603.
[5] *L. Chandra Kumar v. Union of India*, (1997) 3 SCC 261.
[6] Durga Das Basu, *Commentary on the Constitution of India* (9th edn, LexisNexis 2021).
[7] H.M. Seervai, *Constitutional Law of India: A Critical Commentary* (4th edn, Universal Law Publishing 2015).
[8] Law Commission of India, *Report No. 272: Assessment of Statutory Frameworks and Procedural Efficiency* (Government of India 2022).
[9] *State of Maharashtra v. Mayer Hans George*, AIR 1965 SC 722.
`;

    case 'court_pleading':
      return `# IN THE SUPREME COURT OF INDIA
## EXTRAORDINARY ORIGINAL WRIT JURISDICTION
### WRIT PETITION (CIVIL) NO. ______ OF ${year}

**IN THE MATTER OF:**
1. **[PETITIONER NAME]**, S/o ____________, Residing at ____________________, New Delhi.
...**PETITIONER**

**VERSUS**

1. **UNION OF INDIA**, Through the Secretary, Ministry of Law and Justice, Shastri Bhawan, New Delhi - 110001.
2. **[PRINCIPAL STATUTORY AUTHORITY / RESPONDENT NO. 2]**, Through its Authorized Officer, New Delhi.
...**RESPONDENTS**

---

### SYNOPSIS AND CHRONOLOGICAL LIST OF DATES AND EVENTS
| Date | Chronological Event | Legal Significance |
|:---|:---|:---|
| **01.01.${year - 1}** | Enactment / Notification of the Impugned Action / Notice relating to ${cleanPrompt}. | Foundation of cause of action; arbitrariness commenced. |
| **15.06.${year - 1}** | Detailed representation submitted by the Petitioner highlighting severe prejudice. | Due exhaustion of non-judicial administrative remedies. |
| **10.09.${year - 1}** | Rejection of representation without reasons or opportunity of personal hearing. | Patent breach of principles of natural justice (*audi alteram partem*). |
| **Recent** | Impugned order issued threatening coercive recovery / disqualification against the Petitioner. | Imminent violation of fundamental rights under Articles 14 and 21. |

---

### MEMORANDUM OF WRIT PETITION UNDER ARTICLE 32 OF THE CONSTITUTION OF INDIA
**TO,**  
**THE HON'BLE THE CHIEF JUSTICE OF INDIA AND HIS COMPANION JUSTICES OF THE HON'BLE SUPREME COURT OF INDIA.**

**THE HUMBLE PETITION OF THE PETITIONER ABOVENAMED MOST RESPECTFULLY SHOWETH:**

1. That the Petitioner is a law-abiding citizen of India invoking the extraordinary original jurisdiction of this Hon'ble Court to protect fundamental rights guaranteed under Articles 14, 19(1)(g), and 21 of the Constitution, which have been gravely compromised by the arbitrary actions of the Respondents in relation to **${cleanPrompt}**.

2. **BRIEF FACTS OF THE CASE:**
   - 2.1 That the Petitioner has conducted all operations with unblemished compliance and professional diligence.
   - 2.2 That on the impugned date, Respondent No. 2 arbitrarily initiated proceedings concerning ${cleanPrompt}, entirely contrary to established statutory regulations and principles of proportionality.
   - 2.3 That the Petitioner's detailed objections and evidence were discarded summarily without a reasoned speaking order, compelling the Petitioner to approach this Hon'ble Court as no alternative efficacious remedy exists.

3. **GROUNDS FOR RELIEF:**
   - **A. BECAUSE** the impugned actions of the Respondents violate Article 14 of the Constitution of India, being manifestly arbitrary, discriminatory, and devoid of rational nexus to any legitimate statutory object [*E.P. Royappa v. State of Tamil Nadu* [1]].
   - **B. BECAUSE** the Respondents failed to adhere to the cardinal principles of natural justice (*audi alteram partem*), rendering the impugned proceedings void ab initio in terms of the ratio in *Maneka Gandhi v. Union of India* [2].
   - **C. BECAUSE** the doctrine of proportionality, established as an essential facet of Articles 14 and 21 in *Modern Dental College v. State of M.P.* [3], was violated by imposing punitive burdens where lesser intrusive measures were available.
   - **D. BECAUSE** administrative orders affecting civil rights must be supported by reasons, and the absence of reasons constitutes an incurable illegality under the authority of *S.N. Mukherjee v. Union of India* [4].

### COMPARATIVE TABLE OF CONSTITUTIONAL INFRINGEMENTS
| Statutory Provision / Action | Constitutional Guarantee Infringed | Authoritative Precedent | Mandatory Relief Required |
|:---|:---|:---|:---|
| Impugned Action on ${cleanPrompt} | Article 14 (Equality & Non-Arbitrariness) | *E.P. Royappa v. State of Tamil Nadu* [1] | Setting aside of the impugned notification. |
| Denial of Reasonable Opportunity | Principles of Natural Justice | *Swadeshi Cotton Mills v. Union of India* [5] | Restoration of status quo ante with fresh fair hearing. |
| Unjustified Restriction | Article 19(1)(g) / Article 21 | *K.S. Puttaswamy v. Union of India* [6] | Declaration of invalidity and restraint from coercive action. |

4. **PRAYER:**
Wherefore, in the facts and circumstances stated hereinabove, it is most respectfully prayed that this Hon'ble Court may be pleased to:
   - (a) Issue an appropriate Writ of Certiorari or any other writ, order, or direction quashing and setting aside the impugned orders and proceedings concerning **${cleanPrompt}**;
   - (b) Issue an appropriate Writ of Mandamus directing the Respondents to cease and desist from taking any coercive measures against the Petitioner;
   - (c) Pass such other and further order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.

AND FOR THIS ACT OF KINDNESS, THE PETITIONER SHALL AS IN DUTY BOUND EVER PRAY.

### TABLE OF NUMBERED PRECEDENTS & AUTHORITIES
[1] *E.P. Royappa v. State of Tamil Nadu*, (1974) 4 SCC 3.
[2] *Maneka Gandhi v. Union of India*, (1978) 1 SCC 248.
[3] *Modern Dental College & Research Centre v. State of M.P.*, (2016) 7 SCC 353.
[4] *S.N. Mukherjee v. Union of India*, (1990) 4 SCC 594.
[5] *Swadeshi Cotton Mills v. Union of India*, (1981) 1 SCC 664.
[6] *K.S. Puttaswamy v. Union of India*, (2017) 10 SCC 1.

**DRAWN & FILED BY:**  
**[ADVOCATE-ON-RECORD]**  
Counsel for the Petitioner  
Supreme Court of India, New Delhi
`;

    case 'contract_deed':
      return `# COMMERCIAL AGREEMENT FOR ${cleanPrompt.toUpperCase()}
**THIS AGREEMENT** is made and executed on this _____ day of ____________, ${year}, by and between:

1. **[PARTY A / FIRST PARTY]**, a company incorporated under the Companies Act, 2013 [1], having its registered office at ____________________________________ (hereinafter referred to as the "**First Party**", which expression shall unless repugnant to the context include its successors and permitted assigns);

**AND**

2. **[PARTY B / SECOND PARTY]**, a company incorporated under the laws of India, having its principal place of business at ____________________________________ (hereinafter referred to as the "**Second Party**", which expression shall include its successors and permitted assigns).

---

### RECITALS:
**WHEREAS:**
A. The First Party is actively engaged in the commercial enterprise of [Business Description];  
B. The Second Party possesses specialized technical capability, infrastructure, and expertise in relation to **${cleanPrompt}**;  
C. The Parties have agreed to enter into this Agreement in accordance with the provisions of the Indian Contract Act, 1872 [2] to formalize their mutual rights, covenants, representations, and operational terms.

---

### OPERATIVE PROVISIONS:

#### 1. DEFINITIONS & INTERPRETATION
- "**Applicable Law**" means any Indian statute, notification, by-law, rule, regulation, or judicial decree having force of law.
- "**Effective Date**" shall mean the date of execution of this Agreement.
- "**Deliverables**" means all works, milestones, reports, and services required to be provided in relation to ${cleanPrompt}.

#### 2. SCOPE OF SERVICES & OPERATIVE COVENANTS
The Second Party covenants to furnish the Deliverables in strict conformity with professional industry standards and statutory benchmarks under the Specific Relief Act, 1963 [3]. Neither party shall assign its rights or liabilities hereunder without prior written consent.

#### 3. DELIVERABLES, MILESTONES & PERFORMANCE MATRIX
| Milestone / Deliverable | Target Delivery Schedule | Acceptance Criteria | Governing Authority / Default Remedy |
|:---|:---|:---|:---|
| Phase I: Initial Inception & Audit regarding ${cleanPrompt} | T + 30 Business Days | Unanimous Sign-off by Review Committee | Rectification within 7 calendar days |
| Phase II: Substantive Implementation & Execution | T + 90 Business Days | Performance Verification & Stress Testing | Liquidated Damages under Section 74, Contract Act [2] |
| Phase III: Final Handover & Statutory Compliance | T + 120 Business Days | Unconditional Certificate of Completion | *Kailash Nath Associates v. DDA* [4] |

#### 4. CONSIDERATION & PAYMENT TERMS
In consideration of the faithful performance of ${cleanPrompt}, the First Party shall pay the contract sum according to the stipulated milestone invoicing schedule within thirty (30) days of receipt of a valid tax invoice.

#### 5. INTELLECTUAL PROPERTY & CONFIDENTIALITY
All Intellectual Property Rights created or developed during the execution of this Agreement shall vest exclusively in the First Party upon payment. Both parties undertake to maintain strict confidentiality of proprietary data.

#### 6. INDEMNIFICATION & LIMITATION OF LIABILITY
Each Party agrees to indemnify, defend, and hold harmless the other Party from and against any direct third-party claims, liabilities, damages, and costs arising out of fraud, gross negligence, or willful default in terms of Chitty on Contracts [5].

#### 7. GOVERNING LAW & DISPUTE RESOLUTION
This Agreement shall be governed by and construed in accordance with the substantive laws of India. Any dispute arising out of or in connection with this Agreement shall be referred to arbitration in New Delhi under the provisions of the Arbitration and Conciliation Act, 1996 [6], before a sole arbitrator appointed by mutual consent.

**IN WITNESS WHEREOF**, the Parties hereto have caused this Agreement to be executed by their duly authorized representatives as of the date first above written.

**FOR [PARTY A]:**  
________________________  
Name:  
Designation: Authorized Signatory  

**FOR [PARTY B]:**  
________________________  
Name:  
Designation: Authorized Signatory  

### REFERENCES & NUMBERED TABLE OF AUTHORITIES
[1] Companies Act, 2013, Section 21 (Execution of Bills of Exchange, Deeds, and Agreements).
[2] Indian Contract Act, 1872, Sections 10, 73, and 74 (Validity of Covenants & Liquidated Damages).
[3] Specific Relief Act, 1963, Sections 10, 14, and 20A (Special Provisions relating to Infrastructure Contracts).
[4] *Kailash Nath Associates v. Delhi Development Authority*, (2015) 4 SCC 136.
[5] H.G. Beale (ed), *Chitty on Contracts* (34th edn, Sweet & Maxwell 2021).
[6] Arbitration and Conciliation Act, 1996, Sections 7, 11, and 34.
`;

    case 'legal_notice':
      return `# ADVOCATE CHAMBERS & LEGAL COUNSEL
**CHAMBER OF [ADVOCATE NAME], B.A. LL.B. (HONS.)**  
Advocate, High Court of Delhi  
Chamber No. ___, Delhi High Court Chambers Block, New Delhi - 110003  
Email: counsel.chambers@delhibar.in | Contact: +91 98XXXXXXXX

---

**DISPATCH DETAILS:**  
**REGISTERED POST WITH ACKNOWLEDGEMENT DUE / SPEED POST / BY HAND**  
Ref No: AC/LN/${year}/____  
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

**TO:**  
**[DEFAULTING PARTY / RECIPIENT NAME]**  
Resident of / Registered Office at: ____________________________________  
New Delhi - 1100XX  

---

### SUBJECT: FORMAL LEGAL NOTICE UNDER SECTION 138 OF NI ACT [1] / SECTION 73 OF INDIAN CONTRACT ACT [2] IN RESPECT OF ${cleanPrompt.toUpperCase()}

**SIR / MADAM,**

Under explicit instructions and on behalf of my client, **[CLIENT NAME]**, residing at ____________________, New Delhi, I hereby serve upon you this formal Legal Notice as follows:

1. That my client is a law-abiding citizen engaged in legitimate commercial operations with an impeccable reputation.

2. That on or about [Date], you approached my client requesting services and commitments concerning **${cleanPrompt}**, promising strict adherence to commercial terms and legal standards governed by the Indian Contract Act, 1872 [2].

3. That relying on your explicit covenants, my client duly performed all obligations without delay.

4. That contrary to your express covenants, you committed willful and flagrant breaches, causing serious financial distress and reputational injury to my client [*Central Inland Water Transport Corp. v. Brojo Nath Ganguly* [3]].

### TABULAR SUMMARY OF BREACHES & OUTSTANDING LIABILITIES
| Particulars of Breach / Default | Date of Breach | Principal Amount Due | Interest Claimed (@ 18% p.a.) | Total Outstanding Liability |
|:---|:---|:---|:---|:---|
| Failure of compliance regarding ${cleanPrompt} | [Date] | INR [Principal Sum] | INR [Interest] | INR [Total Due] |
| Consequential losses & administrative costs | [Date] | INR [Loss Amount] | N/A | INR [Loss Amount] |

5. **I THEREFORE**, by means of this Notice, call upon you to rectify the aforesaid breaches and pay the total outstanding sum of **INR [Total Sum]** within a period of **fifteen (15) days** from the receipt of this Notice in accordance with *Dalmia Cement v. Galaxy Traders* [4].

6. **PLEASE TAKE NOTE** that in the event of your failure to comply within the stipulated fifteen days, my client has issued unequivocal instructions to institute appropriate civil and criminal proceedings against you before competent courts, entirely at your risk, costs, and legal consequences.

A copy of this Notice has been retained in my office for judicial record.

**Yours faithfully,**

______________________________  
**[ADVOCATE NAME]**  
Advocate, High Court of Delhi  
Enrollment No.: D/______/${year}

### REFERENCES & NUMBERED TABLE OF AUTHORITIES
[1] Negotiable Instruments Act, 1881, Section 138 (Dishonour of Cheque and Statutory Demand Notice).
[2] Indian Contract Act, 1872, Section 73 (Compensation for Loss or Damage Caused by Breach of Contract).
[3] *Central Inland Water Transport Corp. v. Brojo Nath Ganguly*, (1986) 3 SCC 156.
[4] *Dalmia Cement (Bharat) Ltd. v. Galaxy Traders & Agencies*, (2001) 1 SCC 631.
[5] Sir Dinshah Fardunji Mulla, *The Indian Contract Act* (16th edn, LexisNexis 2021).
`;

    case 'legal_opinion':
      return `# CONFIDENTIAL LEGAL MEMORANDUM & OPINION
**TO:** Board of Directors / Senior Counsel  
**FROM:** Senior Legal Advisor  
**DATE:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}  
**RE:** Comprehensive Legal Opinion and Risk Matrix regarding **${cleanPrompt.toUpperCase()}**

---

### 1. EXECUTIVE SUMMARY
This memorandum provides a targeted legal analysis concerning the statutory exposures, regulatory obligations, and contractual liabilities surrounding **${cleanPrompt}**. Based on prevailing statutory provisions and authoritative judicial pronouncements of the Supreme Court of India, we conclude that while current operations withstand preliminary scrutiny, procedural exposures persist unless remedial governance measures are implemented immediately.

### 2. QUESTIONS PRESENTED
1. Whether the operational modalities associated with **${cleanPrompt}** trigger mandatory regulatory compliance under Indian statutes?
2. What are the principal enforcement risks and liability consequences under prevailing judicial standards?
3. What protective contractual and procedural measures must be enacted to mitigate corporate exposure?

### 3. SHORT ANSWERS & STATUTORY NEXUS
- **To Question 1:** Affirmative. The subject matter attracts statutory oversight requiring rigorous documentary adherence under the Companies Act, 2013 [1].
- **To Question 2:** Moderate to substantial enforcement exposure if procedural safeguards are absent under Section 73 of the Indian Contract Act [2].
- **To Question 3:** Implementation of standardized covenants, compliance audits, and structured dispute escalation clauses in line with D.D. Basu's administrative law doctrines [3].

### 4. STATUTORY & DOCTRINAL REGULATORY MATRIX
| Applicable Statute / Regulation | Key Statutory Obligation | Governing Precedent | Risk Level |
|:---|:---|:---|:---|
| Indian Contract Act, 1872 (Sec. 73-74) [2] | Mitigation of damages and proving actual loss | *Kailash Nath Associates v. DDA* [4] | Medium |
| Specific Relief Act, 1963 (Sec. 14, 20A) [5] | Mandatory statutory injunction barriers in infrastructure | *Bhaven Construction v. Sardar Sarovar* [6] | Low-Medium |
| Companies Act, 2013 (Sec. 166) [1] | Fiduciary diligence expected of corporate directors | *Dale & Carrington v. P.K. Prathapan* [7] | High |

### 5. IN-DEPTH LEGAL DISCUSSION
Under Indian jurisprudence, liability arising in connection with ${cleanPrompt} is governed by substantive contract terms and overarching regulatory norms. The Supreme Court in *Kailash Nath Associates* [4] established that liquidated damages cannot be claimed as a punitive penalty; actual loss or a genuine pre-estimate must be substantiated. Furthermore, in infrastructure and commercial governance, the principles in *Bhaven Construction* [6] circumscribe judicial interference in arbitral processes.

### 6. RISK ASSESSMENT & MITIGATION BLUEPRINT
We recommend a three-tiered mitigation roadmap:
1. Conduct an immediate forensic compliance audit of all documentation related to ${cleanPrompt}.
2. Amend standard agreements to introduce indemnities and expedited arbitral resolution under the Arbitration and Conciliation Act, 1996 [8].
3. Formulate clear internal oversight protocols to demonstrate good-faith corporate diligence.

**Respectfully submitted,**  
**AuraPraxis Legal Advisory Group**

### REFERENCES & NUMBERED TABLE OF AUTHORITIES
[1] Companies Act, 2013, Section 166 (Duties and Fiduciary Responsibilities of Directors).
[2] Indian Contract Act, 1872, Sections 73 and 74 (Compensation for Breach and Liquidated Damages).
[3] Durga Das Basu, *Administrative Law* (6th edn, LexisNexis 2020).
[4] *Kailash Nath Associates v. Delhi Development Authority*, (2015) 4 SCC 136.
[5] Specific Relief Act, 1963, Sections 14 and 20A (Special Provisions for Infrastructure Projects).
[6] *Bhaven Construction v. Executive Engineer, Sardar Sarovar Narmada Nigam Ltd.*, (2022) 1 SCC 75.
[7] *Dale & Carrington Investment (P) Ltd. v. P.K. Prathapan*, (2005) 1 SCC 212.
[8] Arbitration and Conciliation Act, 1996, Sections 7, 9, and 17.
`;

    case 'case_analysis':
      return `# CASE BRIEF & JUDICIAL CRITIQUE: ${cleanPrompt.toUpperCase()}
**Neutral Citation:** [${year}] INSC 412 | **Court:** Supreme Court of India  
**Bench:** Hon'ble Justice A.K. Sikri & Hon'ble Justice D.Y. Chandrachud, JJ.  
**Decided On:** [Date] | **Subject:** Judicial Scrutiny of ${capitalizedTopic}

---

### 1. PROCEDURAL HISTORY & JURISDICTIONAL POSTURE
This matter arose by way of a Special Leave Petition under Article 136 of the Constitution of India [1] impugning the final judgment and order passed by the High Court. The High Court had ruled against the Appellant, holding that procedural non-compliance invalidated substantive statutory rights.

### 2. MATERIAL FACTUAL MATRIX
The dispute revolves around ${cleanPrompt}. The Appellant entered into formal arrangements requiring compliance with specific timelines. The Respondent subsequently cancelled agreements and invoked coercive remedies, asserting fundamental breach.

### 3. CORE LEGAL ISSUES FORMULATED
1. Whether procedural irregularities in relation to ${cleanPrompt} extinguish substantive statutory protections under Article 14 of the Constitution [2]?
2. Whether administrative authorities are bound by the doctrine of legitimate expectation and reasonableness when exercising discretionary powers [*Ramana Dayaram Shetty* [3]]?

### 4. SUMMARY OF CONTENTIONS
| Litigant Party | Primary Legal Arguments | Statutory / Precedential Basis |
|:---|:---|:---|
| **Appellant** | Arbitrary deprivation without opportunity to cure; violation of Article 14 | *E.P. Royappa v. State of Tamil Nadu* [4] |
| **Respondent** | Contractual autonomy and express right of termination upon default | *Radhakrishna Agarwal v. State of Bihar* [5] |

### 5. RATIO DECIDENDI & HOLDING
The Supreme Court allowed the appeal, holding that even within contractual or statutory transactions, the State and its instrumentalities cannot act with manifest arbitrariness. The Court laid down that procedural conditions must be harmonized with substantive justice in accordance with *Maneka Gandhi v. Union of India* [6], and disproportionate penalties cannot be imposed where substantial compliance is demonstrated.

### 6. OBITER DICTA & CONCURRING OBSERVATIONS
In concurring remarks, the Bench observed that modern public law increasingly demands transparent administrative decision-making, and commercial entities dealing with public authorities retain protection against capricious cancellation as expounded by H.M. Seervai [7].

### 7. CRITICAL ACADEMIC COMMENTARY
This decision marks a pivotal reinforcement of the doctrine of fairness in state dealings. By reasserting that the rule of law permeates every administrative interaction concerning ${cleanPrompt}, the Court curtailed unbridled bureaucratic discretion.

### REFERENCES & NUMBERED TABLE OF AUTHORITIES
[1] Constitution of India, 1950, Article 136 (Special Leave to Appeal by Supreme Court).
[2] Constitution of India, 1950, Article 14 (Equality Before Law and Equal Protection).
[3] *Ramana Dayaram Shetty v. International Airport Authority of India*, (1979) 3 SCC 489.
[4] *E.P. Royappa v. State of Tamil Nadu*, (1974) 4 SCC 3.
[5] *Radhakrishna Agarwal v. State of Bihar*, (1977) 3 SCC 457.
[6] *Maneka Gandhi v. Union of India*, (1978) 1 SCC 248.
[7] H.M. Seervai, *Constitutional Law of India: A Critical Commentary* (4th edn, Universal Law Publishing 2015).
`;

    default: // study_aid
      return `# ${cleanPrompt.toUpperCase()} - COMPREHENSIVE STUDY GUIDE & SYNOPSIS
**Subject:** Indian Jurisprudence & Statutory Law | **Level:** LL.B. / LL.M. / Judicial Examination Prep | **Module:** ${capitalizedTopic}

---

## 1. MODULE OVERVIEW & CORE LEARNING OBJECTIVES
This study module covers the statutory, constitutional, and judicial architecture of **${cleanPrompt}**. Candidates preparing for university or judicial examinations must master:
- Essential statutory definitions and jurisdictional ingredients.
- Constitutional standards of review under Articles 14, 19, and 21 of the Constitution [1].
- Leading case law precedents and doctrinal ratios.
- Analytical heuristics for answering hypothetical fact patterns.

## 2. STATUTORY ANATOMY & ESSENTIAL INGREDIENTS
To establish legal liability or establish a cause of action in relation to ${cleanPrompt}, the following cumulative ingredients must be proven:
1. **Legal Standing / Jurisdictional Prerequisite**: The party asserting rights must demonstrate a recognized legal interest.
2. **Breach of Duty or Violation of Law**: Concrete departure from statutory mandates or contractual covenants.
3. **Causation & Measure of Harm**: Direct, unbroken nexus between the impugned conduct and measurable injury.

## 3. COMPARATIVE DOCTRINAL MATRIX
| Legal Doctrine | Statutory Provision | Key Legal Test | Exceptions / Defenses |
|:---|:---|:---|:---|
| **Non-Arbitrariness** | Article 14, Constitution [1] | Rational Nexus & Proportionality Test [*Puttaswamy* [2]] | Valid legislative classification |
| **Audi Alteram Partem** | Natural Justice Principle | Opportunity of Hearing & Reasoned Order [*S.N. Mukherjee* [3]] | Extreme emergency / Statutory exclusion |
| **Substantive Due Process** | Article 21, Constitution [1] | Just, Fair, and Reasonable Standard [*Maneka Gandhi* [4]] | Procedure established by law |

## 4. LANDMARK CASE LAW SYNTHESIS
| Case Citation | Deciding Bench | Core Facts | Ratio Decidendi | Exam Application |
|:---|:---|:---|:---|:---|
| *Maneka Gandhi v. UOI* [4] | 7-Judge Bench | Impounding of passport without reasons | Procedure in Art. 21 must be just, fair, and reasonable. | Quote in any procedural fairness question. |
| *K.S. Puttaswamy v. UOI* [2] | 9-Judge Bench | Constitutional challenge to biometric identity | Privacy is an inalienable fundamental right under Art. 21. | Essential for data & autonomy problems. |
| *Shreya Singhal v. UOI* [5] | Division Bench | Challenge to vagueness in speech restrictions | Overbreadth and vagueness violate fundamental freedoms. | Apply to vague statutory provisions. |

## 5. PROBLEM-SOLVING HEURISTIC (EXAM ISSUE-SPOTTING)
1. **Step 1 - Jurisdiction**: Check whether the forum (High Court, Supreme Court, or District Court) has competent subject-matter jurisdiction.
2. **Step 2 - Identify the Breach**: Spot which specific statutory section or constitutional article is infringed.
3. **Step 3 - Natural Justice Check**: Was prior notice given? Was a speaking order issued?
4. **Step 4 - Proportionality**: Was the remedy or penalty proportionate to the infraction under *Modern Dental College* [6]?
5. **Step 5 - Formulate Remedy**: Specify whether a writ (Mandamus, Certiorari) or civil damages is appropriate.

## 6. SELF-TEST FLASHCARDS (ACTIVE RECALL)
- **Q1: What is the primary constitutional test for non-arbitrariness in administrative action?**  
  *Answer:* The proportionality test established in *Modern Dental College* [6] and *Puttaswamy* [2], requiring a legitimate goal, rational connection, necessity, and balancing of rights.
- **Q2: Does failure to provide a reasoned order invalidate an administrative decision?**  
  *Answer:* Yes. Under *S.N. Mukherjee v. Union of India* [3], recording reasons is a fundamental facet of natural justice.

## 7. REFERENCES & NUMBERED TABLE OF AUTHORITIES
[1] Constitution of India, 1950: Articles 14, 19, 21, 32, and 226.
[2] *K.S. Puttaswamy v. Union of India*, (2017) 10 SCC 1.
[3] *S.N. Mukherjee v. Union of India*, (1990) 4 SCC 594.
[4] *Maneka Gandhi v. Union of India*, (1978) 1 SCC 248.
[5] *Shreya Singhal v. Union of India*, (2015) 5 SCC 1.
[6] *Modern Dental College & Research Centre v. State of M.P.*, (2016) 7 SCC 353.
[7] Durga Das Basu, *Commentary on the Constitution of India* (9th edn, LexisNexis 2021).
[8] Code of Civil Procedure, 1908: Section 9, Order VII, Order XXXIX.
[9] Indian Contract Act, 1872: Sections 10, 73, and 74.
`;
  }
}

/**
 * Formats user raw text directly using AuraPraxis Local Store
 * when Gemini API is busy, offline, or unavailable.
 * Strictly structures the user's inputted words with minimal added text.
 */
export function formatFromLocalStore(text: string, options: FormatOptions): string {
  const archetype = getDocumentArchetype(options.docType);
  const cleanText = text.trim();
  if (!cleanText) {
    return `# ${options.docType.toUpperCase()}\n\n*No input text provided to structure.*`;
  }

  // Extract user-specified citations, statutes, or sources
  const extractedSources: string[] = [];
  const citationPatterns = [
    /[A-Z][a-zA-Z\s\.,&]+v\.?\s+[A-Z][a-zA-Z\s\.,&]+/g,
    /\b\d{4}\s+SCC\b[^\n,]*/g,
    /\bAIR\s+\d{4}\b[^\n,]*/g,
    /\b(Section|Sec\.)\s+\d+[A-Z]?\b[^\n,]*/g,
    /\b[A-Z][a-zA-Z\s]+Act,\s+\d{4}\b/g,
    /\b[A-Z][a-zA-Z\s]+(Code|Constitution|Rules|Regulations|Treatise|Commentary|Review|Journal|Report)\b[^\n,]*/g,
  ];

  for (const pattern of citationPatterns) {
    const matches = cleanText.match(pattern);
    if (matches) {
      matches.forEach(m => {
        const trimmed = m.trim();
        if (trimmed.length > 4 && !extractedSources.includes(trimmed)) {
          extractedSources.push(trimmed);
        }
      });
    }
  }

  const rawParagraphs = cleanText
    .split(/\n{2,}|\n(?=[0-9A-Z\-\*•])/)
    .map(p => p.trim())
    .filter(Boolean);

  const title = rawParagraphs[0]?.replace(/^#+\s*/, '') || options.docType;
  const contentParagraphs = rawParagraphs.length > 1 ? rawParagraphs.slice(1) : rawParagraphs;

  let doc = '';

  if (archetype.category === 'court_pleading') {
    doc = `# IN THE APPROPRIATE COURT OF JURISDICTION
## ${options.docType.toUpperCase()}

### I. MEMORANDUM OF FACTS & PLEADINGS
${contentParagraphs.map((p, idx) => `1.${idx + 1} ${p}`).join('\n\n')}

### II. GROUNDS FOR RELIEF
- **A. GROUNDS OF LAW:**
  The submissions set forth herein substantiate the entitlement of the party to the relief prayed for under applicable statutory provisions.

### III. PRAYER / RELIEF
Wherefore, in light of the above facts, it is respectfully prayed that this Hon'ble Court may be pleased to grant appropriate relief in accordance with law and justice.`;
  } else if (archetype.category === 'academic_research') {
    doc = `# ${title.toUpperCase()}
*A Structured ${options.docType}*

## I. INTRODUCTION & RESEARCH BACKGROUND
${contentParagraphs[0] || cleanText}

${contentParagraphs.length > 1 ? `## II. SUBSTANTIVE ANALYSIS & DOCTRINAL SUBMISSIONS\n${contentParagraphs.slice(1, -1).join('\n\n') || contentParagraphs[1]}\n` : ''}

${contentParagraphs.length > 2 ? `## III. CONCLUSION & FINDINGS\n${contentParagraphs[contentParagraphs.length - 1]}\n` : ''}`;
  } else if (archetype.category === 'legal_notice') {
    doc = `# FORMAL LEGAL NOTICE
**DISPATCHED VIA REGISTERED POST / SPEED POST**
**Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

### RE: LEGAL NOTICE CONCERNING ${title.toUpperCase()}

Under instructions from my client, I hereby serve upon you this formal notice:

${contentParagraphs.map((p, idx) => `${idx + 1}. That ${p}`).join('\n\n')}

**TAKE NOTICE** that you are hereby called upon to comply with the above demands within fifteen (15) days of receipt, failing which appropriate legal proceedings shall be initiated against you at your risk, cost, and consequence.

**ADVOCATE FOR CLIENT**`;
  } else if (archetype.category === 'contract_deed') {
    doc = `# ${options.docType.toUpperCase()}: ${title.toUpperCase()}

### RECITALS & OPERATIVE COVENANTS
${contentParagraphs.map((p, idx) => `#### CLAUSE ${idx + 1}: TERMS\n${p}`).join('\n\n')}

**IN WITNESS WHEREOF**, the parties execute this document on the date first recorded above.`;
  } else if (archetype.category === 'legal_opinion') {
    doc = `# CONFIDENTIAL LEGAL MEMORANDUM
**RE:** ${title}
**DATE:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

### 1. STATEMENT OF FACTS & INQUIRY
${contentParagraphs[0] || cleanText}

${contentParagraphs.length > 1 ? `### 2. LEGAL ANALYSIS & APPLICABLE PRINCIPLES\n${contentParagraphs.slice(1).join('\n\n')}` : ''}

### 3. SUMMARY & OPINION
Based on the submitted materials, compliance should proceed in accordance with prevailing statutory mandates.`;
  } else if (archetype.category === 'case_analysis') {
    doc = `# CASE BRIEF & ANALYSIS: ${title.toUpperCase()}

### 1. MATERIAL FACTS & BACKGROUND
${contentParagraphs[0] || cleanText}

${contentParagraphs.length > 1 ? `### 2. LEGAL SUBMISSIONS & RATIO DECIDENDI\n${contentParagraphs.slice(1).join('\n\n')}` : ''}

### 3. CONCLUSION & OBSERVATIONS
The principles articulated above govern the disposition of the issues under review.`;
  } else {
    // study_aid
    doc = `# STUDY SYNOPSIS: ${title.toUpperCase()}

## 1. CORE CONCEPTS & OVERVIEW
${contentParagraphs[0] || cleanText}

${contentParagraphs.length > 1 ? `## 2. STATUTORY INGREDIENTS & ANALYSIS\n${contentParagraphs.slice(1).join('\n\n')}` : ''}

## 3. KEY TAKEAWAYS & CHECKLIST
Review the provisions and principles outlined above.`;
  }

  // Append user's identified sources as numbered list if present
  if (extractedSources.length > 0) {
    doc += `\n\n## REFERENCES & TABLE OF NUMBERED AUTHORITIES\n` +
      extractedSources.map((s, idx) => `[${idx + 1}] *${s}*`).join('\n');
  }

  return doc;
}

/**
 * Structure raw user text into the EXACT target document structure chosen by the user.
 * Preserves the user's inputted words, keeping newly added words as minimal as possible.
 */
export async function formatLegalDocument(text: string, options: FormatOptions): Promise<ProcessResult> {
  const archetype = getDocumentArchetype(options.docType);

  const prompt = `
You are a precision legal structuring assistant and judicial clerk.
The user has provided their own draft / raw input words.
YOUR TASK: STRUCTURE THE USER'S INPUTTED WORDS INTO THE TARGET DOCUMENT TYPE ("${options.docType}") WHILE KEEPING ANY NEWLY ADDED WORDS AS MINIMAL AS POSSIBLE.

CRITICAL RULES:
1. STRICT PRESERVATION OF USER'S TEXT:
   - DO NOT rewrite, replace, or invent large amounts of new text.
   - Retain the user's inputted words, sentences, phrasing, factual claims, and legal points.
   - Keep any newly added words as MINIMAL as possible — only supply the necessary structural headers, clause/paragraph numbers, and formal layout markers required for "${options.docType}".
   - DO NOT expand a short draft into an unrequested 1500-word essay. If the user provided a brief draft or notes, structure those words cleanly into the archetype sections.
2. STRUCTURAL ORGANIZATION:
   - Organize the user's inputted content under the standard architectural sections appropriate for "${options.docType}" (Category: ${archetype.name}):
${archetype.mandatorySections.map(s => `     * ${s}`).join('\n')}
   - Distribute their points under the correct sections (e.g. facts under Facts, legal grounds under Grounds, remedies under Prayer/Relief, etc.).
3. NUMBERED CITATIONS:
   - If the user mentioned any case laws, Acts, or sources in their input, format them with clean bracketed numbers [1], [2], etc., and list them under a numbered "REFERENCES / TABLE OF AUTHORITIES" section at the bottom.

USER'S RAW INPUTTED TEXT TO STRUCTURE:
${text}
`;

  const systemInstruction = `You are a precision legal structuring assistant. Your sole role is to take the user's inputted words and organize them into the formal structure of "${options.docType}". You must keep newly added words as minimal as possible, strictly preserving the user's original words, arguments, and facts. Number any cited sources with brackets [1], [2]. Never replace the user's draft with an artificial generic essay.`;

  try {
    const response = await callGeminiWithRetry({
      model: options.model || "gemini-4-argon",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for high fidelity to user's actual words
      },
    });

    if (response.text && response.text.trim()) {
      return { formatted: response.text };
    }
  } catch (error: any) {
    console.warn('[GEMINI-SERVICE] Gemini structuring error. Falling back seamlessly to local store archetype:', error?.message || error);
  }

  // Seamless fallback to AuraPraxis Local Store
  const localFormatted = formatFromLocalStore(text, options);
  return { formatted: localFormatted };
}

/**
 * Ensures that any generated legal document strictly includes numbered citations [1], [2]...
 * throughout the text and ends with a corresponding numbered Table of Authorities.
 */
export function enforceNumberedCitations(text: string): string {
  if (!text || !text.trim()) return text;

  // Check if document already has substantial bracketed citations and a numbered references/table of authorities section
  const hasBracketedNumbers = /\[[1-9][0-9]?\]/.test(text);
  const hasRefSection = /(REFERENCES|TABLE OF AUTHORITIES|TABLE OF PRECEDENTS)/i.test(text);
  const refSectionHasNumbers = /(REFERENCES|TABLE OF AUTHORITIES|TABLE OF PRECEDENTS)[\s\S]*?\[[1-9]\]/i.test(text);

  if (hasBracketedNumbers && hasRefSection && refSectionHasNumbers) {
    return text;
  }

  // Extract authorities to number
  const authorities: string[] = [];
  const addAuth = (item: string) => {
    const clean = item.replace(/^[\*\s_\-\[\]]+|[\*\s_\-\[\]]+$/g, '').trim();
    if (clean.length > 5 && !authorities.some(a => a.toLowerCase() === clean.toLowerCase())) {
      authorities.push(clean);
    }
  };

  // Case law patterns
  const caseRegex = /(?:\*+)?([A-Z][a-zA-Z\s\.,&]+v\.?\s+[A-Z][a-zA-Z\s\.,&]+(?:\([0-9]{4}\)\s+[0-9]+\s+[A-Za-z]+(?:\s+[0-9]+)?|AIR\s+[0-9]{4}\s+[A-Za-z]+(?:\s+[0-9]+)?)?)(?:\*+)?/g;
  let match;
  while ((match = caseRegex.exec(text)) !== null) {
    if (match[1] && (match[1].includes(' v.') || match[1].includes(' v '))) {
      addAuth(match[1]);
    }
  }

  // Statutory patterns
  const actRegex = /\b([A-Z][a-zA-Z\s]+Act,\s+\d{4}(?:,\s+(?:Section|Sec\.)\s+\d+[A-Z]?)?)\b/g;
  while ((match = actRegex.exec(text)) !== null) {
    if (match[1]) addAuth(match[1]);
  }

  // Constitutional Article patterns
  const constRegex = /\b(Articles?\s+\d+[A-Z]?(?:\s*\([0-9a-z]+\))?(?:\s+of\s+the\s+Constitution(?:\s+of\s+India)?))\b/gi;
  while ((match = constRegex.exec(text)) !== null) {
    if (match[1]) addAuth(match[1]);
  }

  // Treatises and commentaries
  const treatisePatterns = [
    /Durga Das Basu,?\s*\*?[^\*\n,]+Commentary[^\*\n]*\*?/gi,
    /H\.?M\.?\s*Seervai,?\s*\*?Constitutional Law[^\*\n]*\*?/gi,
    /Sir Dinshah Fardunji Mulla,?\s*\*?[^\*\n]+Contract Act[^\*\n]*\*?/gi,
    /Chitty on Contracts[^\n,]*/gi,
    /Salmond on Jurisprudence[^\n,]*/gi,
    /Law Commission of India,?\s*Report[^\n,]*/gi
  ];
  for (const tp of treatisePatterns) {
    while ((match = tp.exec(text)) !== null) {
      if (match[0]) addAuth(match[0]);
    }
  }

  if (authorities.length === 0) {
    return text;
  }

  let enrichedText = text;
  // Inject [N] in text for each authority if not already tagged
  authorities.forEach((auth, idx) => {
    const num = idx + 1;
    const tag = ` [${num}]`;
    const escaped = auth.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})(\\s*\\[\\d+\\])?`, 'i');
    enrichedText = enrichedText.replace(regex, (m, p1, p2) => {
      if (p2) return m; // already tagged
      return `${p1}${tag}`;
    });
  });

  // Ensure a clean Numbered References Section
  const refHeader = '\n\n## REFERENCES & NUMBERED TABLE OF AUTHORITIES\n';
  const refList = authorities.map((a, idx) => `[${idx + 1}] *${a}*`).join('\n');

  if (/(REFERENCES|TABLE OF AUTHORITIES|TABLE OF PRECEDENTS)/i.test(enrichedText)) {
    enrichedText = enrichedText.replace(
      /(##+ (?:REFERENCES|TABLE OF AUTHORITIES|TABLE OF PRECEDENTS)[\s\S]*?$)/i,
      `## REFERENCES & NUMBERED TABLE OF AUTHORITIES\n${refList}`
    );
  } else {
    enrichedText += refHeader + refList;
  }

  return enrichedText;
}

/**
 * Generate a complete, authoritative document of the selected type from scratch.
 * Generates an exhaustive, peak-level publication-grade document with systematically numbered citations.
 */
export async function generateLegalDocument(prompt: string, options: FormatOptions): Promise<{ generated: string; humanized?: string; comparativeNote?: string }> {
  const archetype = getDocumentArchetype(options.docType);

  const generatePrompt = `
Generate an exhaustive, publication-grade, peak-level legal document from scratch based on the topic/instructions below:
DOCUMENT TYPE: "${options.docType}" (Category: ${archetype.name})
CITATION STYLE: ${options.citationStyle}
TOPIC / BRIEF / INSTRUCTIONS: ${prompt}

MANDATORY SPECIFICATIONS:
1. ARCHETYPE FIDELITY: Follow the exact structure, headers, and stylistic conventions for ${archetype.name}.
2. MANDATORY SECTIONS:
${archetype.mandatorySections.map(s => `   - ${s}`).join('\n')}

3. STRICT PROHIBITIONS:
${archetype.strictlyProhibited.map(p => `   - ${p}`).join('\n')}

4. MANDATORY NUMBERED CITATIONS PROTOCOL (CRITICAL REQUIREMENT):
   - ALL citations must be systematically numbered with bracketed numbers [1], [2], [3], etc.
   - Append in-text numbered reference tags [1], [2], [3] immediately following case names, statutory provisions, constitutional articles, or treatises:
     * e.g., *Kesavananda Bharati v. State of Kerala* [1]
     * e.g., Article 21 of the Constitution of India [2]
     * e.g., Durga Das Basu, *Commentary on the Constitution of India* [3]
     * e.g., *Maneka Gandhi v. Union of India* [4]
   - Conclude with an exhaustive, systematically numbered "REFERENCES & TABLE OF AUTHORITIES" section at the end of the document listing every authority:
     [1] *Full Case Name*, Citation, Court/Bench.
     [2] Statutory Act, Section / Provision.
     [3] Author, *Title of Treatise*, Edition, Publisher.
     [4] ...
   - In comparative matrix tables, include the citation numbers next to case names (e.g., *Case Name* [1]).

5. PEAK DOCTRINAL SUBSTANCE & MULTI-TIER REPOSITORY:
   - Provide deep, scholarly analysis (at least 1500 words).
   - Integrate concrete statutory provisions (Acts, Sections, Constitutional Articles, Rules).
   - Cite 8-12 landmark and persuasive judicial precedents (SCC, AIR, SCR) with their specific legal ratio.
   - Interweave foundational treatises and commentaries (e.g., Mulla, D.D. Basu, H.M. Seervai, Salmond, Chitty).
   - Reference Law Commission Reports and international conventions where applicable.
   - Include a comprehensive Markdown comparative table or analytical matrix table.
`;

  const systemInstruction = `You are an esteemed legal scholar, advocate, and senior drafter.
Your task is to generate a comprehensive, authoritative, peak-level document from scratch adhering strictly to the architecture of "${options.docType}".
CRITICAL DIRECTIVES:
- Every citation must be explicitly numbered in-text with brackets [1], [2], [3] and correspond to a numbered "REFERENCES & TABLE OF AUTHORITIES" section at the end.
- Format strictly as appropriate for "${options.docType}".
- Academic Article -> Title, Abstract, Keywords, Introduction, Doctrinal Framework, Substantive Sections, Comparative Matrix Table, Conclusion, and Numbered References.
- Petition / Writ / Appeal -> Formal court pleading with Court Heading, Parties, Synopsis & List of Dates, Facts, Numbered Grounds ("A. BECAUSE... [1]"), Comparative Table, Prayer, Verification, and Table of Numbered Precedents.
- Case Brief -> Neutral citation, Procedural History, Facts, Issues, Contentions Table, Ratio Decidendi, Commentary, and Numbered References.
- Legal Memo -> TO, FROM, RE, Executive Summary, Questions Presented, Short Answers, Discussion, Risk Matrix, Numbered Authorities.
- Contract -> Commercial contract with recitals, operative clauses, obligations table, dispute resolution, execution blocks.
- Notice -> Advocate letterhead, formal demand, table of claims, 15/30 day notice period, signature.
- Study Aid -> Comprehensive study guide with learning objectives, statutory ingredients, doctrinal matrix, landmark cases, exam checklist, numbered flashcards, and references.

${WRITING_RULES}
`;

  try {
    const response = await callGeminiWithRetry({
      model: options.model || "gemini-4-argon",
      contents: generatePrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      },
    });

    if (response.text && response.text.trim()) {
      const processed = enforceNumberedCitations(response.text);
      return { generated: processed };
    }
  } catch (error: any) {
    console.warn('[GEMINI-SERVICE] Gemini generation error. Falling back seamlessly to local store archetype:', error?.message || error);
  }

  // Seamless fallback to AuraPraxis Local Store
  const localGenerated = generateFromLocalStore(prompt, options);
  const processedFallback = enforceNumberedCitations(localGenerated);
  return { generated: processedFallback };
}
