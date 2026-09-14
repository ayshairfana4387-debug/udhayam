export const bankFormGuide = [
  {
    id: 'account-number',
    category: 'Bank Details',
    keywords: ['account', 'passbook', 'cheque', 'bank', 'number', 'a/c', 'khata'],
    question: 'Where can I find my Bank Account Number?',
    answer: 'Look at the front inside cover page of your Bank Passbook or at the bottom line of your Cheque Leaf. It is an 11 to 16-digit number clearly printed next to "A/C No." or "Account Number".',
    locationTip: 'Front page of Passbook (near your name) OR middle digits printed on Cheque leaf.',
    sampleIllustration: 'Passbook Cover / Cheque Leaf',
    exampleValue: 'e.g. 30219485721 or 0422101002341'
  },
  {
    id: 'ifsc-code',
    category: 'Bank Details',
    keywords: ['ifsc', 'code', 'branch', 'neft', 'rtgs', 'cheque'],
    question: 'Where can I find the IFSC Code?',
    answer: 'Your 11-character IFSC code is printed on the top or bottom of your cheque leaf and also on the front page of your passbook. The first 4 characters represent the bank (e.g. SBIN, CNRB, IDIB), the 5th character is always 0, followed by 6 branch code digits.',
    locationTip: 'Top header of Cheque Leaf or below branch address in Passbook.',
    sampleIllustration: 'Cheque Leaf Header',
    exampleValue: 'e.g. SBIN0001234 or CNRB0002841'
  },
  {
    id: 'micr-code',
    category: 'Bank Details',
    keywords: ['micr', 'cheque', 'magnetic', 'clearing'],
    question: 'What is MICR Code and where is it located?',
    answer: 'The MICR code is a 9-digit numeric code used for cheque clearing. You can find it printed in special magnetic ink at the bottom of your cheque leaf, directly next to the 6-digit cheque number.',
    locationTip: 'Bottom bar of cheque leaf (second group of 9 digits between quotes).',
    sampleIllustration: 'Bottom line of Cheque Leaf',
    exampleValue: 'e.g. 641002014'
  },
  {
    id: 'cost-of-project',
    category: 'Business & Project',
    keywords: ['project', 'cost', 'machinery', 'equipment', 'estimate', 'quotation', 'total'],
    question: 'What should I fill for "Cost of Project / Project Cost"?',
    answer: 'Add together: 1) Cost of Machinery/Equipment (supported by supplier quotations), 2) Raw Material / Initial Stock (Working Capital), and 3) Shop or Workshed setup expenses. The total must match the supplier quotation invoices you submit.',
    locationTip: 'Summary page of your Project Report (DPR) or total of attached Quotations.',
    sampleIllustration: 'Project Report / Supplier Invoice Total',
    exampleValue: 'e.g. ₹2,50,000 (Machinery ₹1.8L + Stock ₹50k + Renovation ₹20k)'
  },
  {
    id: 'margin-money',
    category: 'Business & Project',
    keywords: ['margin', 'promoter', 'contribution', 'own', 'subsidy', 'investment'],
    question: 'What is "Promoter\'s Contribution / Margin Money"?',
    answer: 'This is the portion of the project cost that you must invest from your own personal funds. For government schemes like PMEGP, it is only 5% for special categories (Women, SC/ST, OBC, Ex-Servicemen, Rural) and 10% for general categories. The bank finances the remaining 90% to 95%.',
    locationTip: 'Check the scheme guidelines: usually 5% to 10% of total project cost.',
    sampleIllustration: 'Self Contribution in Bank Voucher',
    exampleValue: 'e.g. For ₹2,00,000 loan, 5% margin is ₹10,000'
  },
  {
    id: 'udyam-urn',
    category: 'Identity & Registration',
    keywords: ['udyam', 'registration', 'msme', 'urn', 'certificate', 'number'],
    question: 'Where can I find my Udyam Registration Number (URN)?',
    answer: 'Look at the top center of your Udyam Registration Certificate downloaded from udyamregistration.gov.in. It is formatted as "UDYAM-XX-00-0000000" where XX is your state code.',
    locationTip: 'Top header of your green Udyam Registration Certificate.',
    sampleIllustration: 'Udyam Certificate Header',
    exampleValue: 'e.g. UDYAM-TN-03-0012345'
  },
  {
    id: 'pan-and-aadhaar',
    category: 'Identity & Registration',
    keywords: ['pan', 'aadhaar', 'uid', 'identity', 'card'],
    question: 'Where can I find PAN and Aadhaar numbers?',
    answer: 'PAN is a 10-digit alphanumeric code (e.g. ABCDE1234F) printed in the middle of your physical PAN card. Aadhaar is your 12-digit unique identity number printed clearly on your Aadhaar card or downloaded e-Aadhaar letter.',
    locationTip: 'Front face of physical PAN card and Aadhaar card.',
    sampleIllustration: 'PAN Card & Aadhaar Front',
    exampleValue: 'PAN: ABCDE1234F | Aadhaar: 1234 5678 9012'
  },
  {
    id: 'existing-credit',
    category: 'Loan & Financials',
    keywords: ['existing', 'loan', 'credit', 'past', 'borrowing', 'kcc'],
    question: 'What should I write for "Existing Credit Facilities / Previous Loans"?',
    answer: 'If you have any active loan (such as a Kisan Credit Card, Vehicle Loan, or Personal Loan), mention the bank name, loan type, and current outstanding balance. If you do NOT have any active loans, simply write "NIL" or "NONE".',
    locationTip: 'Your active loan passbook or recent CIBIL credit statement.',
    sampleIllustration: 'Loan Passbook / Write NIL',
    exampleValue: 'e.g. "NIL" or "Canara Bank KCC - ₹35,000 outstanding"'
  },
  {
    id: 'term-loan-vs-wc',
    category: 'Loan & Financials',
    keywords: ['term', 'working', 'capital', 'facility', 'cash', 'credit', 'limit'],
    question: 'What is the difference between "Term Loan" and "Working Capital"?',
    answer: 'A "Term Loan" is a one-time loan for purchasing long-term assets like machinery, equipment, computers, or tools, repaid in monthly installments. "Working Capital" (or Cash Credit) is a revolving limit to purchase raw materials, daily inventory, and meet day-to-day shop expenses.',
    locationTip: 'Choose "Term Loan" for machinery; choose "Working Capital" for stock and materials.',
    sampleIllustration: 'Loan Purpose Type',
    exampleValue: 'Machinery = Term Loan | Stock/Supplies = Working Capital'
  },
  {
    id: 'gst-turnover',
    category: 'Business & Project',
    keywords: ['gst', 'turnover', 'tax', 'sales', 'registration'],
    question: 'Do I need a GST Number to apply for a government loan?',
    answer: 'For micro loans under ₹10 Lakhs (like MUDRA Shishu/Kishore or small PMEGP), GST is NOT compulsory if your annual turnover is below the threshold (₹40 Lakhs for goods, ₹20 Lakhs for services). You can write "Exempted / Turnover below threshold" and attach your local trade license or sales estimate.',
    locationTip: 'GST Certificate (if registered) or write "Exempted below threshold".',
    sampleIllustration: 'Trade License / GST Certificate',
    exampleValue: 'Write "Exempted - Turnover below ₹40L"'
  }
];
