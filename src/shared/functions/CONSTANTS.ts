export const USER_ROLES = {
  SUPER_USER: "Super-User",
  ADMIN_USER: "Admin",
  USER: "User",
  GUEST_USER: "Guest",
  CLIENT_USER: "Client"
};

export const userRolesAccessRights = (role: string) => { };

export const BANK_STATEMENT_CONFIGURATIONS = {
  STANDARD_BANK: {
    bankName: "STANDARD BANK NAMIBIA LIMITED",
    bankNameConfig: {
      startRow: 11,
      endRow: 1
    },
    accountNumber: "042739330 - SBNMNANX",
    accountNumberConfig: {
      startRow: 5,
      endRow: 1
    },
    statementStart: 16,
    statementEnd: "Closing Balance",
    referenceFieldName: "Originator Reference",
    valueDateFieldName: "Value Date"
  },
  NED_BANK: {
    bankName: "Customer No:",
    bankNameConfig: {
      startRow: 7,
      endRow: 0
    },
    accountNumber: "11000284892",
    accountNumberConfig: {
      startRow: 8,
      endRow: 1
    },
    statementStart: 16,
    statementEnd: "Closing Balance",
    referenceFieldName: "Description",
    valueDateFieldName: "Value Date"
  },

}
