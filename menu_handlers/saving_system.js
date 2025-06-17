export class SavingSystem {
    constructor(dataName){
        this.dataName = dataName
        this.data = null
    }

    save(){
        if (!this.data) return

        const jsonString = JSON.stringify(this.data)

        window.localStorage.setItem(this.dataName, jsonString)
    }

    load(loadHandler){
        const jsonString = window.localStorage.getItem(this.dataName)

        if (!jsonString) return

        this.data = JSON.parse(jsonString)

        loadHandler(this.data)
    }
}