"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { helpItemKeys } from "@/constants/help-items.constant";

// FAQ content for ACTA platform
const faqContent = {
  "help.questions.getStarted.question": "How to get started with ACTA?",
  "help.questions.getStarted.answer":
    "To get started with ACTA, first connect your Stellar wallet (like Freighter), then set up your profile in the profile section. Once configured, you can create credentials, search for existing credentials, or generate an API key to integrate ACTA into your applications.",

  "help.questions.whatIsACTA.question": "What is ACTA?",
  "help.questions.whatIsACTA.answer":
    "ACTA is a decentralized platform built on the Stellar network that allows you to create, verify, and manage digital credentials securely and transparently. It uses smart contracts to ensure the integrity and authenticity of credentials.",

  "help.questions.createCredential.question": "How to create a credential?",
  "help.questions.createCredential.answer":
    "Go to the 'Credentials' > 'Create' section in the sidebar menu. Fill out the form with the required information such as credential type, subject data, and any additional information. Once completed, the credential will be stored on the Stellar blockchain.",

  "help.questions.searchCredential.question": "How to search for credentials?",
  "help.questions.searchCredential.answer":
    "Use the 'Search' function in the credentials section. You can search by different criteria such as credential ID, issuer address, or credential type. The results will show all credentials that match your search criteria.",

  "help.questions.apiKey.question": "How to get an API Key?",
  "help.questions.apiKey.answer":
    "Go to the 'API Key' section in the sidebar menu. There you can generate a new API key that will allow you to integrate ACTA functionalities into your external applications. Make sure to save the key securely as you won't be able to see it again.",

  "help.questions.stellarNetwork.question":
    "What Stellar network does ACTA use?",
  "help.questions.stellarNetwork.answer":
    "ACTA operates on Stellar's testnet for development and testing. To use ACTA, make sure your wallet is configured for Stellar's testnet. You can get test XLM from the official Stellar faucet.",

  "help.questions.verifyCredential.question": "How to verify a credential?",
  "help.questions.verifyCredential.answer":
    "Credentials in ACTA are automatically verified through the Stellar blockchain. You can verify the authenticity of a credential by checking its hash on the network, verifying the issuer's signature, and confirming it hasn't been altered since creation.",
};

export const HelpAccordion = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {helpItemKeys.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger className="text-left">
            {faqContent[item.questionKey as keyof typeof faqContent]}
          </AccordionTrigger>
          <AccordionContent>
            {faqContent[item.answerKey as keyof typeof faqContent]}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
