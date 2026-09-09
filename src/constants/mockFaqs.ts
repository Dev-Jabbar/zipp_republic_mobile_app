export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const mockFaqs: FaqItem[] = [
  {
    id: "1",
    question: "WHAT PAYMENT METHODS CAN I USE?",
    answer:
      "We accept major debit/credit cards, bank transfer, and USSD payments through our secure checkout.",
  },
  {
    id: "2",
    question: "CAN I PURCHASE ITEMS WITH ANOTHER CURRENCY?",
    answer:
      "Prices are shown in Nigerian Naira (₦). You can switch your display currency using the selector, but your card will be charged in NGN at checkout.",
  },
  {
    id: "3",
    question: "CAN I MAKE CHANGES TO MY ORDER AFTER IT'S BEEN PLACED?",
    answer:
      "Contact our support team within 1 hour of placing your order and we'll do our best to accommodate changes before it ships.",
  },
  {
    id: "4",
    question: "DO YOU OFFER E-GIFT CARDS FOR INTERNATIONAL CUSTOMERS?",
    answer:
      "Not yet — e-gift cards are currently available for Nigerian customers only. International support is coming soon.",
  },
  {
    id: "5",
    question: "HOW DO I SET UP A SUBSCRIPTION ORDER?",
    answer:
      "Subscription ordering isn't available yet. Follow us for updates on when this feature launches.",
  },
  {
    id: "6",
    question: "HOW TO RETURN MY ITEMS?",
    answer:
      "Items can be returned within 7 days of delivery if unworn and in original packaging. Visit our Shipping & Returns page for the full process.",
  },
];
