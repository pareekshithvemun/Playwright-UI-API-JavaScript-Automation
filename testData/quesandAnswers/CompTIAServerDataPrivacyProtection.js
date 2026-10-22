const answersOfCourse = [
  {
    question: "Which term refers to sensitive health information?",
    answers: ["PHI"],
  },
  {
    question:
      "Which security standard relates to payment card holder information?",
    answers: ["PCI DSS"],
  },
  {
    question: "Which type of malware is self-propagating?",
    answers: ["Worm"],
  },
  {
    question:
      "Which term describes the act of sending a fake message in an attempt to trick someone into divulging sensitive information?",
    answers: ["Phishing"],
  },
  {
    question: "Which solutions are directly related to DLP?",
    answers: [
      "Digital watermarks",
      "Smart card use for sending file attachments",
    ],
  },
  {
    question:
      "You are attempting to manually label a file as “PII” on a Windows host, but there is no “Classification” tab in the file properties. What is the problem?",
    answers: ["FSRM is not installed on that server"],
  },
  {
    question:
      "You need to configure AWS to discover sensitive files stored in S3 buckets. Which service should you use?",
    answers: ["Macie"],
  },
  {
    question:
      "Which strategy can help protect sensitive information on lost or stolen smartphones?",
    answers: ["Remote wipe"],
  },
  {
    question: "What is wrong with the following Linux command?dd if=/dev/sdb1 of=/dev/zero bs=4096 status=progress",
    answers: ["/dev/zero should be used with if="],
  },
];
export let answersOfCompTIAServerDataPrivacyProtection = {
  answersOfCourse,
};
