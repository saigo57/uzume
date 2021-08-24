package helper

import (
	"bytes"
	"encoding/json"
	"flag"
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
