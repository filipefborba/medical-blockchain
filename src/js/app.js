const imagesArray = [
	{
		id: 0,
		name: "Chris",
		picture: "images/Chris.jpg",
		examCount: 5,
	},
	{
		id: 1,
		name: "Chad",
		picture: "images/Chad.jpg",
		examCount: 3,
	},
	{
		id: 2,
		name: "Robert",
		picture: "images/Robert.jpg",
		examCount: 4,
	},
	{
		id: 3,
		name: "Scarlett",
		picture: "images/Scarlett.jpg",
		examCount: 2,
	},
];

App = {
	web3Provider: null,
	contracts: {},
	patients: [],

	init: async function () {
		// Load pets.
		$("document").ready(function () {
			// App.updateView(patients);
		});

		return await App.initWeb3();
	},

	initWeb3: async function () {
		// Modern dapp browsers...
		if (window.ethereum) {
			App.web3Provider = window.ethereum;
			try {
				// Request account access
				await window.ethereum.enable();
			} catch (error) {
				// User denied account access...
				console.error("User denied account access");
			}
		}
		// Legacy dapp browsers...
		else if (window.web3) {
			App.web3Provider = window.web3.currentProvider;
		}
		// If no injected web3 instance is detected, fall back to Ganache
		else {
			App.web3Provider = new Web3.providers.HttpProvider(
				"http://localhost:7545"
			);
		}
		web3 = new Web3(App.web3Provider);

		return App.initContract();
	},

	initContract: function () {
		$.getJSON("Medical.json", function (data) {
			// Get the necessary contract artifact file and instantiate it with @truffle/contract
			var MedicalArtifact = data;
			App.contracts.Medical = TruffleContract(MedicalArtifact);

			// Set the provider for our contract
			App.contracts.Medical.setProvider(App.web3Provider);

			// Use our contract to retrieve and mark the adopted pets
			return App.getPatients();
		});

		return App.bindEvents();
	},

	bindEvents: function () {
		$(document).on("click", ".submit-add-patient", App.handleCreatePatient);
		$(document).on("click", ".submit-add-record", App.handleCreateRecord);
		$(document).on("click", ".btn-patient", App.handleToggle);
	},

	getPatients: async function () {
		var medicalInstance;

		App.contracts.Medical.deployed()
			.then(async function (instance) {
				medicalInstance = instance;

				return await medicalInstance.getPatientsCount.call();
			})
			.then(async function (count) {
				let totalPatients = count.c[0];
				let promises = [];
				for (let i = 0; i < totalPatients; i++) {
					promises.push(await medicalInstance.getPatient.call(i));
				}
				let patients = await promises;
				return patients;
			})
			.then(async function (patients) {
				let p = await patients;
				var parsedPatients = [];
				for (let i = 0; i < p.length; i++) {
					let parsedPatient = {
						index: p[i][0].c[0],
						name: web3.toAscii(p[i][1]),
						age: p[i][2].c[0],
						examCount: p[i][3].c[0],
					};
					parsedPatients.push(parsedPatient);
				}
				App.patients = parsedPatients;
				App.updateView();
			})
			.catch(function (err) {
				console.log(err.message);
			});
	},

	handleCreatePatient: function (event) {
		event.preventDefault();

		var patientName = $("#add-patient-form").find("#patient-name").val();
		var patientAge = $("#add-patient-form").find("#patient-age").val();

		var medicalInstance;

		web3.eth.getAccounts(function (error, accounts) {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];

			App.contracts.Medical.deployed()
				.then(function (instance) {
					medicalInstance = instance;

					return medicalInstance.insertPatient(
						patientName,
						patientAge,
						{
							from: account,
						}
					);
				})
				.then(function (result) {
					return App.getPatients();
				})
				.catch(function (err) {
					console.log(err.message);
				});
		});
	},

	handleCreateRecord: function (event) {
		event.preventDefault();

		var patientId = $("#add-record-form").find("#patient-id").val();
		// var covidStatus = $("#add-record-form").find("#covid-status").val();

		var medicalInstance;

		web3.eth.getAccounts(function (error, accounts) {
			if (error) {
				console.log(error);
			}

			var account = accounts[0];

			App.contracts.Medical.deployed()
				.then(function (instance) {
					medicalInstance = instance;

					return medicalInstance.updatePatient(patientId, {
						from: account,
					});
				})
				.then(function (result) {
					return App.getPatients();
				})
				.catch(function (err) {
					console.log(err.message);
				});
		});
	},

	handleToggle: function () {
		$("#addPatientsRow").toggle();
		$("#addRecordRow").toggle();
	},

	updateView: function () {
		var patientsRow = $("#patientsRow").empty();
		var patientTemplate = $("#patientTemplate");

		var patients = App.patients;
		for (i = 0; i < patients.length; i++) {
			patientTemplate.find(".panel-title").text(patients[i].name);
			patientTemplate.find("img").attr("src", imagesArray[i % 4].picture);
			patientTemplate.find(".patient-id").text(patients[i].index);
			patientTemplate.find(".patient-age").text(patients[i].age);
			patientTemplate
				.find(".patient-exam-count")
				.text(patients[i].examCount);
			patientTemplate
				.find(".btn-patient")
				.attr("data-id", patients[i].index);

			patientsRow.append(patientTemplate.html());
		}
	},
};

$(function () {
	$(window).load(function () {
		App.init();
	});
});
