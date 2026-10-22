const answersOfBenchMark = [
  {
    question: "Which Azure services are considered to be IaaS?",
    answers: ["VNets","Virtual machines"],
  },
  {
    question: "Which Azure services are considered to be PaaS?",
    answers: ["Azure AD","Managed databases"],
  },
  {
    question: "Microsoft 365 is an example of which cloud service model?",
    answers: ["SaaS"],
  },
  {
    question: "Which physical security mechanism uses a set of two doors where the outer door must close before the inner door opens?",
    answers: ["Access control vestibule"],
  },
  {
    question: "Which Azure resource placement option is contained within an Azure region?",
    answers: ["Availability zone"],
  },
  {
    question: "Which Azure CLI command shows the various Azure clouds?",
    answers: ["az cloud list"],
  },
  {
    question: "Which Azure item contains one or more data centers?",
    answers: ["Availability zone"],
  },
  {
    question: "Which Azure component is a subscription always associated with?",
    answers: ["Azure AD tenant"],
  },
  {
    question: "Which aspect of using Azure is always associated directly with a subscription?",
    answers: ["Billing","Resource creation"],
  },
  {
    question: "Which Azure resources are directly associated with VNets?",
    answers: ["Route table","Network security group"],
  },
  {
    question: "What is the relationship between VNets and deploying new virtual machines?",
    answers: ["The virtual machine must be deployed in the same region as the VNet"],
  },
  {
    question: "Which type of Azure Managed Disk provides the best disk I/O performance?",
    answers: ["Ultra"],
  },
  {
    question: "You are planning the deployment of an IaaS clustered application in Azure. All cluster nodes must have concurrent read and write access to storage. What should you do?",
    answers: ["Create one Managed Disk and enable the shared disk option"],
  },
  {
    question: "Which remote management protocol is normally used to manage Linux hosts?",
    answers: ["SSH"],
  },
  {
    question: "You do not want each Azure virtual machine publicly accessible through their own public IP addresses. What should you use to allow virtual machine remote management from your on-premises network?",
    answers: ["Azure Bastion"],
  },
  {
    question: "What is the benefit of using Azure management groups?",
    answers: ["Ability to apply policies to multiple subscriptions"],
  },
  {
    question: `You need to limit regions in which Azure virtual machines can be deployed. Your Azure AD tenant consists of three subscriptions. What should you do to minimize administrative effort for applying policies now and in the future?`,
    answers: ["Create a management group and move subscriptions to it"],
  },
  {
    question: "Which of the options are examples of PII?",
    answers: ["Bank account number","Home address"],
  },
  {
    question: "Which Azure product acts as a central security information and event management solution?",
    answers: ["Azure Sentinel"],
  },
  {
    question: "Which user account security recommendation enhances user sign-in security?",
    answers: ["MFA"],
  }

];
export let AzureCloudAwarenessEntryLevel = {
  answersOfBenchMark,
};
