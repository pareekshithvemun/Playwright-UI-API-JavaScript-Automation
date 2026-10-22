const answersOfBenchMark = [
  {
    question:
      "What are the three classifications of resources in the Google Cloud Platform?",
    answers: ["Zonal Resources", "Regional Resources", "Global Resources"],
  },
  {
    question:
      "In which ways can we interact with the services and products available in the Google Cloud Platform?",
    answers: ["GCP Console", "GCP Command Line Interface", "Client Libraries"],
  },
  {
    question:
      "If you want to retain control over the underlying server hardware and operating system when deploying a compute solution, which service will best fit your needs?",
    answers: ["Google Compute Engine (GCE)"],
  },
  {
    question:
      "Which feature of the Google Cloud Platform is used to hierarchically manage resources by project, folder, and organization?",
    answers: ["Resource Manager"],
  },
  {
    question:
      "Which are provided to administrators and teams when using folder resources in Google Cloud Platform?",
    answers: ["Isolation boundaries", "Additional grouping mechanism"],
  },
  {
    question:
      "Which type of load balancer should be used when serving content to users all over the world?",
    answers: ["Global"],
  },
  {
    question:
      "Which load balancing component contains a set of values, such as the protocol used to connect to backends, various distribution and session settings, health checks, and timeouts?",
    answers: ["Back-end services"],
  },
  {
    question: "Which of the options are machine type families in Google Cloud?",
    answers: ["E2", "N1", "N2D", "N2"],
  },
  {
    question: "Which statements are true when stopping or suspending a VM?",
    answers: [
      "Temporary external IPs are released",
      "No cost associated with stopping or suspending",
    ],
  },
  {
    question:
      "Which API must be enabled to use VM Manager to manage your operating systems?",
    answers: ["OS Config API"],
  },
  {
    question: "Which statements are true when stopping or suspending a VM?",
    answers: [
      "No cost associated with stopping or suspending",
      "Temporary external IPs are released",
    ],
  },
  {
    question:
      "To view all buckets in your Google cloud project using gsutil, which command should you specify?",
    answers: ["gsutil ls"],
  },
  {
    question:
      "When transferring data into a GCP cloud storage bucket, what are the available options that you can select as a source to transfer your data from?",
    answers: [
      "Azure storage container",
      "Amazon S3 bucket",
      "Google cloud storage bucket",
    ],
  },
  {
    question:
      "Which two options are available to connect your physical, on-premises network to the Google Cloud platform?",
    answers: ["Cloud Interconnect", "Cloud VPN"],
  },
  {
    question:
      "When creating your VPC, what are the two modes of subnet creation that you can choose from?",
    answers: ["Automatic", "Custom"],
  },
  {
    question:
      "What is the name of the script that needs to be downloaded and ran, in order to install the cloud monitoring agent on a Linux device?",
    answers: ["add-monitoring-agent-repo.sh"],
  },
  {
    question:
      "What must you configure in your GCP project to ensure that all new VMs created automatically install the monitoring and logging agents?",
    answers: ["Agent rules"],
  },
  {
    question:
      "Which of the below options is the name for a collection of permissions that determine what operations are allowed on a resource?",
    answers: ["Role"],
  },
  {
    question:
      "Which of the options are the default roles that are created automatically in your GCP project?",
    answers: ["Owner", "Viewer", "Editor"],
  },
  {
    question:
      "Which option is available for you to determine which permissions you are granting via a new role, without creating the role?",
    answers: ["Simulate"],
  },
];
export let GCPCloudAwarenessEntryLevel = {
  answersOfBenchMark,
};
