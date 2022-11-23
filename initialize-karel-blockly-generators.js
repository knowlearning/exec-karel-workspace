import 'blockly/javascript.js'

export default function initializeKarelBlocklyGenerators(Blockly) {
    /**
     * @license
     * 
     * Copyright 2019 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    /**
     * @fileoverview Define generation methods for custom blocks.
     * @author samelh@google.com (Sam El-Husseini)
     */

    const CONDITIONS_TO_KAREL_JS = {
        FRONT_CLEAR: 'karel.frontIsClear()',
        FRONT_BLOCKED: '!karel.frontIsClear()',
        STONES_PRESENT: 'karel.stonesPresent()',
        STONES_NOT_PRESENT: '!karel.stonesPresent()'
    }

    // More on generating code:
    // https://developers.google.com/blockly/guides/create-custom-blocks/generating-code
    Blockly.JavaScript['karel_main'] = function (block) {
        var statements_program = Blockly.JavaScript.statementToCode(block, 'program');
        return statements_program
    };

    Blockly.JavaScript['karel_move'] = function () {
        return 'karel.move();\n'
    };

    //  Monkeypatch callnoreturn so we can make the await
    // TODO Fix Bug when Learner Defins Fn Name that Starts with a Number
    Blockly.JavaScript['procedures_callnoreturn'] = function (block) {
        let funcName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
        // Add prefix for user defined function
        return `await KAREL_BlOCKLY_USER_DEFINED_${funcName}();\n`
    };

    Blockly.JavaScript['karel_turn_left'] = function () {
        return 'karel.turnLeft();\n'
    };

    Blockly.JavaScript['karel_place_stone'] = function () {
        return 'karel.placeStone();\n'
    };

    Blockly.JavaScript['karel_pickup_stone'] = function () {
        return 'karel.pickStone();\n'
    };

    Blockly.JavaScript['karel_if_dropdown'] = function (block) {
        var dropdown_condition = CONDITIONS_TO_KAREL_JS[block.getFieldValue('CONDITION')];
        var statements_then = Blockly.JavaScript.statementToCode(block, 'THEN');
        var code = 'if (' + dropdown_condition + ') { await step();\n';
        code += statements_then
        code += '}\n'
        return code;
    };

    Blockly.JavaScript['karel_while_dropdown'] = function (block) {
        var dropdown_condition = CONDITIONS_TO_KAREL_JS[block.getFieldValue('CONDITION')];
        var statements_loop = Blockly.JavaScript.statementToCode(block, 'LOOP');
        var code = 'while (' + dropdown_condition + ') { await step();\n';
        code += statements_loop + '\n'
        code += '}\n'
        return code;
    };
}