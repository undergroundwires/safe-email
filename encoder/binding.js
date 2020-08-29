function dataBinding(oneWayToView) {  // eslint-disable-line no-unused-vars
    const state = new Proxy(oneWayToView, {
        set(obj, property, value) {
            obj[property] = value;
            renderBoundElements(property, value);
        }
    });
    for (const key of Object.keys(oneWayToView)) {
        convertMustachesToBinds(key);
        renderBoundElements(key, oneWayToView[key]);
    }
    subscribeViewCallbacks();
    return state;
    function getElementsByXPath(xpath)
    {
        const results = [];
        const query = document.evaluate(xpath, document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i));
        }
        return results;
    }
    function convertMustachesToBinds(key) {
        const mustacheText = `{{ ${key} }}`;
        const xpath = `//body//*[not(self::script)][contains(text(),'${mustacheText}')]`;
        const matchingElements = getElementsByXPath(xpath);
        for (const element of matchingElements) {
            element.innerHTML = element.innerHTML.replace(mustacheText, `<span data-bind="${key}"></span>`);
        }
    }
    function renderValue(element, value) {
        element.innerHTML = escapeHtml(value);
    }
    function toggleVisibility(element, show) {
        if(!show) {
            element.style.display = 'none';
        } else {
            element.style.display = 'flex';
        }
    }
    function subscribeViewCallbacks() {
        const elements = document.querySelectorAll('[data-on-input]');
        for (const element of elements) {
            const targetFunction = element.getAttribute('data-on-input');
            element.addEventListener('input', (event) => {
                const escaped = JSON.stringify(event.target.value);
                const target = targetFunction.replace('$event', escaped);
                this.eval(target);
            });
        }
    }
    function getFalseConditions(conditions) {
        const evaluated = conditions
            .filter((c) => c.startsWith('!'))
            .map((c) => c.substr(1));
        if (evaluated.some((i) => i.startsWith('!'))) {
            return getFalseConditions(evaluated);
        }
        return evaluated;
    }
    function clearConditions(text) {
        return text.replace(/^!+|$/g, ''); // trims ! from left
    }
    function evaluateCondition(condition){
        const conditions = condition.split('&&').map((v) => v.trim());
        const falseConditionedProperties = getFalseConditions(conditions);
        const stateProperties = conditions.map((condition) => clearConditions(condition));
        const results = stateProperties.map((prop) => {
            const value = Boolean(state[prop]);
            const result = falseConditionedProperties.includes(prop) ? !value : value;
            return result;
        });
        const show = results.every((result) => result);
        return show;
    }
    function renderBoundElements(property, value) {
        const valueHolders = document.querySelectorAll(`[data-bind=${property}]`);
        for (const element of valueHolders) {
            renderValue(element, value);
        }
        const valueCheckers = document.querySelectorAll(`[data-if~="${property}"]`);
        for (const element of valueCheckers) {
            const show = evaluateCondition(element.dataset['if']);
            toggleVisibility(element, show);
        }
    };
    function escapeHtml(str) {
        return (str + '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        })[m]);
    }
}
