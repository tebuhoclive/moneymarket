interface IBank {
    name: string,
    code: string,
    country: string
}

const SouthAfricanBanks:IBank[] = [
    {
        name: "ABSA",
        code: "632005",
        country: "ZAR"
    },
    {
        name: "Bank of Athens",
        code: "410506",
        country: "ZAR"
    },
    {
        name: "Bidvest Bank",
        code: "462005",
        country: "ZAR"
    },
    {
        name: "Capitec Bank",
        code: "470010",
        country: "ZAR"
    },
    {
        name: "First National Bank SA",
        code: "250655",
        country: "ZAR"
    },
    {
        name: "Investec Private Bank",
        code: "580105",
        country: "ZAR"
    },
    {
        name: "Nedbank SA",
        code: "198765",
        country: "ZAR"
    },
    {
        name: "SA Post Bank (Post Office)",
        code: "460005",
        country: "ZAR"
    },
    {
        name: "Standard Bank of SA",
        code: "051001",
        country: "ZAR"
    }
]

const NamibianBanks:IBank[]  = [
    {
        name: "First National Bank Namibia",
        code: "280172",
        country: "NAM"
    },
    {
        name: "Bank Windhoek",
        code: "483772",
        country: "NAM"
    },
    {
        name: "Nedbank Namibia",
        code: "461609",
        country: "NAM"
    },
    {
        name: "Standard Bank Namibia",
        code: "087373",
        country: "NAM"
    }
]

export const allBanks = [...SouthAfricanBanks, ...NamibianBanks].sort((a, b) => {
    const nameA = a.name;
    const nameB = b.name;

    return nameA.localeCompare(nameB);
  });

export const getUniversalBankCode = (bankName: string, banks:IBank[]) => {
    const bank = banks.find(bank => bank.name === bankName);
    return bank ? bank.code : "Bank not found";
}