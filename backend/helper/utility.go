package helper

import (
	"bytes"
	"encoding/json"
	"flag"
	"os"
)

func JsonIndent(json_byte []byte) (string, error) {
	var buf bytes.Buffer
	err := json.Indent(&buf, json_byte, "", "  ")
	if err != nil {
		return "", err
	}
	return buf.String(), nil
}

func IsTesting() bool {
	return flag.Lookup("test.v") != nil
}

func DirExists(dir_path string) bool {
	if f, err := os.Stat(dir_path); os.IsNotExist(err) || !f.IsDir() {
		return false
	}
	return true
}
