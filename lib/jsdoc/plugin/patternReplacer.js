class PatternReplacement {
    constructor(rPattern, vValue) {
        this.rPattern = rPattern;
        this.vValue = vValue;
    }
}

class PatternReplacer {
    constructor() {
        this.reset();
    }
    add(oPatternReplacement) {
        this.aPatternReplacement.push(oPatternReplacement);
    }
    reset(){
        this.aPatternReplacement = [];
    }
    replaceAll(sData) {
        this.aPatternReplacement.forEach(function(oPatternReplacement){
            sData = sData.replace(oPatternReplacement.rPattern, oPatternReplacement.vValue);
        });
        return sData;
    }
}

module.exports = {PatternReplacer, PatternReplacement}