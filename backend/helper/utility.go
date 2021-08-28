package helper

import (
	"bytes"
	crand "crypto/rand"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/labstack/echo"
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

func FileExists(path string) bool {
	_, err := ioutil.ReadFile(path)
	if err != nil {
		return false
	}
	return true
}

func CreateFile(path string) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	return nil
}

func SecureRandomStr(b int) string {
	k := make([]byte, b)
	if _, err := crand.Read(k); err != nil {
		panic(err)
	}
	return fmt.Sprintf("%x", k)
}

func LoggedinWrokspaceId(c echo.Context) string {
	auth := c.Request().Header.Get(echo.HeaderAuthorization)
	basic := "basic "
	l := len(basic)

	if len(auth) > l && strings.EqualFold(auth[:l], basic) {
		b, _ := base64.StdEncoding.DecodeString(auth[l:])
		cred := string(b)
		for i := 0; i < len(cred); i++ {
			if cred[i] == ':' {
				return cred[:i]
			}
		}
	}

	return ""
}
