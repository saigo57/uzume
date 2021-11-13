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
	"path/filepath"
	"strings"

	"github.com/labstack/echo"
)

type ErrorMessage struct {
	ErrorMessage string `json:"error_message"`
}

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

func MakeRouteDir(path string) error {
	dir_path := filepath.Dir(path)

	return MakeDir(dir_path)
}

func MakeDir(dir_path string) error {
	if !DirExists(dir_path) {
		if err := os.Mkdir(dir_path, 0777); err != nil {
			return err
		}
	}

	return nil
}

func SplitFileNameAndExt(file_name string) (string, string) {
	ext := filepath.Ext(file_name)
	basename := filepath.Base(file_name)
	ext_trim := 0

	if len(ext) > 1 && ext[0] == '.' {
		if ext == file_name {
			return file_name, ""
		}

		ext = ext[1:]
		ext_trim = 1
	} else {
		ext = ""
	}

	return basename[0 : len(basename)-len(ext)-ext_trim], ext
}
