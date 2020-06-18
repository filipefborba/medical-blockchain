pragma solidity >=0.5.0 <0.7.0;

contract Medical {
    struct Patient {
        uint256 index;
        bytes32 name;
        uint256 age;
        uint256 examCount;
    }
    Patient[] public patients;
    uint256 public totalPatients;

    constructor() public {
        totalPatients = 0;
    }

    event UserCreated(uint256 index, bytes32 name, uint256 age, uint256 examCount);
    event UserUpdated(uint256 index, bytes32 name, uint256 age, uint256 examCount);

    function insertPatient(bytes32 name, uint256 age) public returns (uint256 count) {
        Patient memory newPatient = Patient(totalPatients, name, age, 0);
        patients.push(newPatient);
        totalPatients++;

        emit UserCreated(totalPatients, name, age, 0);
        return totalPatients;
    }

    function updatePatient(uint256 index) public returns (uint256 examCount) {
        patients[index].examCount += 1;

        emit UserUpdated(patients[index].index, patients[index].name, patients[index].age, patients[index].examCount);
        return patients[index].examCount;
    }

    function getPatient(uint256 i) public view returns (
            uint256 index,
            bytes32 name,
            uint256 age,
            uint256 examCount
        )
    {
        require(index >= 0 || index <= totalPatients, "User index out of range.");

        return (
            patients[i].index,
            patients[i].name,
            patients[i].age,
            patients[i].examCount
        );
    }

    function getPatientsCount() public view returns (uint256 count) {
        return totalPatients;
    }
}
