package model

import (
	"encoding/json"
	"testing"
	"uzume_backend/test_helper"

	"github.com/stretchr/testify/assert"
)

// func TestDirExists(t *testing.T) {
// }

type test_json_data struct {
	Foo string `json:"foo"`
	Bar string `json:"bar"`
}

func TestJsonAccessorReadJson(t *testing.T) {
	test_helper.InitializeTest()
	json_accessor := NewJsonAccessor()
	json_path := "./../fixture/test.json"
	json_byte, _ := json_accessor.ReadJson(json_path)
	json_data := new(test_json_data)
	json.Unmarshal(json_byte, json_data)
	assert.Equal(t, json_data.Foo, "1")
	assert.Equal(t, json_data.Bar, "2")
}

func TestJsonAccessorSaveJson(t *testing.T) {
	test_helper.InitializeTest()
	json_accessor := NewJsonAccessor()
	json_path := test_helper.BuildFilePath("test.json")
	json_data := new(test_json_data)
	json_data.Foo = "3"
	json_data.Bar = "4"
	json_accessor.SaveJson(json_path, json_data)

	json_byte, _ := json_accessor.ReadJson(json_path)
	json_data_read := new(test_json_data)
	json.Unmarshal(json_byte, json_data_read)
	assert.Equal(t, json_data_read.Foo, "3")
	assert.Equal(t, json_data_read.Bar, "4")
}

// テスト時にテストフォルダ外にsaveしようとした場合エラーが出ること
func TestJsonAccessorSaveJson_error(t *testing.T) {
	test_helper.InitializeTest()
	json_accessor := NewJsonAccessor()
	illegal_test_file_path := test_helper.BuildFilePath("../_illegal_test_file_name.json")
	json_data := new(test_json_data)
	err := json_accessor.SaveJson(illegal_test_file_path, json_data)
	assert.Equal(t, err.Error(), "テスト用フォルダ外へのアクセスです")
}
