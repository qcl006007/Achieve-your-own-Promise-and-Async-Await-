const getData = () => {return new Promise(resolve => setTimeout(() => resolve("data"),1000))};

function* testG() {
    const data1 = yield getData();
    console.log("data1 " + data1);

    const data2 = yield getData();
    console.log("data2 " + data2);

    return "success";
}

function synctogenerator(func) {
    return function () {
        const gen = func.apply(this, arguments);
        return new Promise((resolve, reject) => {
            function step(key, data) {
                let genResult;
                console.log("param " + data);
                try{
                    genResult = gen[key](data);
                } catch(error) {
                    reject(error);
                }

                const {value, done} = genResult;

                if(done) {
                    resolve(value);
                } else {
                    return Promise.resolve(value).then(val => step("next", val), error => step("throw", error));
                }
            }
            step("next");
        });
    }
}

synctogenerator(testG)().then(val => console.log(val));