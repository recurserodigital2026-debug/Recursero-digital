export const generateWithRetry = (generatorFn, isValidFn, maxRetries = 15) => {
    let intentos = 0;
    
    while (intentos < maxRetries) {
        const calculo = generatorFn();
        if (isValidFn(calculo)) {
            return calculo;
        }
        intentos++;
    }
    console.error("GenerateWithRetry: No se puede generar un cálculo válido luego de varios intentos.");
    return { pregunta: "1 x 1 =", respuesta: 1, isFallback: true};
};