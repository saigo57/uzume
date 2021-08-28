package test_helper

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
)

func InitializeTest() {
	test_work_dir := BuildFilePath("")

	if err := os.RemoveAll(test_work_dir); err != nil {
		fmt.Println(err)
	}

	if err := os.Mkdir(test_work_dir, 0777); err != nil {
		fmt.Println(err)
	}
}

func BuildBasicAuthorization(id, token string) string {
	authorization := fmt.Sprintf("%s:%s", id, token)
	return "basic " + base64.StdEncoding.EncodeToString([]byte(authorization))
}

func BuildFilePath(path string) string {
	project_root := os.Getenv("PROJECT_ROOT")
	return filepath.Join(project_root, "/backend/tmp/uzume_test_work/", path)
}
