import ExcelJS from "exceljs";
import path from "path";
import XLSX from "xlsx";
import { logger } from "../../logger.js";
import { faker } from "@faker-js/faker";

class ExcelHelperAndDataGenerator {
  static timestamp = new Date();
  static epochTime = ExcelHelperAndDataGenerator.timestamp.getTime();
  static time = ExcelHelperAndDataGenerator.timestamp
    .toISOString()
    .replace(/:/g, "-")
    .replace(/\./g, "_");
  static timeUsedinAssignCreation =
    ExcelHelperAndDataGenerator.timestamp.toISOString();
  static workbook = new ExcelJS.Workbook();
  static worksheet =
    ExcelHelperAndDataGenerator.workbook.addWorksheet("Sheet 1");
  static fileName = `${ExcelHelperAndDataGenerator.epochTime}.xlsx`;

  async getPath(frameworkPath, fileName) {
    let filePath;
    try {
      const absolutePath = path.resolve(__dirname, ".."); // this line is used to get file path till project root
      // const absolutePath = path.resolve("."); // this line give path till folder before root of this project folder
      const directoryPath = path.dirname(absolutePath);
      filePath = path.join(directoryPath, frameworkPath, fileName);
    } catch (error) {
      if (error.code == "ENOENT") {
        logger.info("File location is incorrect");
      } else {
        logger.info(error);
      }
    }

    return filePath;
  }

  // Function to pick a random name and split it into first name and last name
  // async pickRandomName() {
  //   let names = [
  //     "Allan Ross",
  //     "Peter Gill",
  //     "Lydia Booker",
  //     "James Fritz",
  //     "Jo Andersen",
  //     "Glenda Giles",
  //     "Brian Miller",
  //     "Alana Simon",
  //     "Elma Moyer",
  //     "Chong Holmes",
  //     "Kristy Stafford",
  //     "Lacy Lewis",
  //     "Maude Mueller",
  //     "Lyndon Reese",
  //     "Freeman Jenkins",
  //     "Wim Perry",
  //     "Harley Tanner",
  //     "Jacques Bishop",
  //     "Maximo Estrada",
  //     "Benton Novak",
  //     "Erick West",
  //     "Hyman Sullivan",
  //     "Gwen Swanson",
  //     "Lindsey Holloway",
  //     "Eliseo Holloway",
  //     "Rowena Hill",
  //     "Everette Bailey",
  //     "Becky Murillo",
  //     "Jocelyn Spencer",
  //     "Arlene Page",
  //   ];
  //   const randomIndex = Math.floor(Math.random() * names.length);
  //   const fullName = names[randomIndex];
  //   const [firstName, lastName] = fullName.split(" ");
  //   return { firstName, lastName };
  // }

  async dataGenerator(numberofUsers, userForAssignMent) {
    for (let i = 1; i <= numberofUsers; i++) {
      let fName, lName, role, firstName, lastName,loginName,passWord,email,userID;
      if (userForAssignMent) {
        fName = "Talent";
        lName = "Enablement";
        role = "TeamManager";
        const randomNumber = Math.floor(Math.random() * (999 - 10 + 1)) + 10;
        loginName = `${fName}_${lName}_${randomNumber}`;
        passWord = "P@ssw0rd123@";
        email = `${loginName}@noemail.com`;
        userID = loginName;



      } else {
        do {
          firstName = faker.person.firstName();
          lastName = faker.person.lastName();
        } while (!this.isValidName(firstName) || !this.isValidName(lastName));

        fName = firstName;
        lName = lastName;
        if (i == numberofUsers && numberofUsers >= 2) {
          role = "ContentCoordinator";
        } else if (i == numberofUsers - 1 && numberofUsers >= 2) {
          role = "ContentCurator";
        } else if (i == numberofUsers - 2 && numberofUsers >= 2) {
          role = "LearningAdmin";
        } else if (i == numberofUsers - 3 && numberofUsers >= 2) {
          role = "TeamManager";
        } else if (i == numberofUsers - 4 && numberofUsers >= 2) {
          role = "Site Admin";
        } else {
          role = "Learner";
        }
        loginName = `${fName}_${lName}_${i}`;
        passWord = "P@ssw0rd123@";
        email = `${loginName}@noemail.com`;
        userID = loginName;
      }

      ExcelHelperAndDataGenerator.worksheet.addRow([
        loginName,
        passWord,
        role,
        email,
        fName,
        lName,
        userID,
      ]);
    }
  }

  isValidName(name) {
    return /^[A-Za-z\s]+$/.test(name);
  }

  // this creates dynamic excel sheet with random data, data we get from above dataGenerator method
  async excelSheetCreation(NumberOfUsers, userForAssignMent) {
    const filePath = await this.getPath(
      "testData/userExcel",
      ExcelHelperAndDataGenerator.fileName
    );
    ExcelHelperAndDataGenerator.worksheet.addRow([
      "loginName",
      "passWord",
      "Userrole",
      "email",
      "fName",
      "lName",
      "userID",
    ]);
    await this.dataGenerator(NumberOfUsers, userForAssignMent);
    await ExcelHelperAndDataGenerator.workbook.xlsx.writeFile(filePath);
  }

  async readDataFromExcel(filePath, sheetName) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];
    const res = XLSX.utils.sheet_to_json(worksheet);
    return res;
  }

  async dataCreation(numberOfUsers, userForAssignMent) {
    let pathofExcel = await this.getPath(
      "testData/userExcel",
      ExcelHelperAndDataGenerator.fileName
    );
    await this.excelSheetCreation(numberOfUsers, userForAssignMent);
    return await this.readDataFromExcel(pathofExcel, "Sheet 1");
  }
}

export default ExcelHelperAndDataGenerator;
