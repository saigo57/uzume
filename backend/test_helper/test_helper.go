package test_helper

import (
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

func BuildFilePath(path string) string {
	project_root := os.Getenv("PROJECT_ROOT")
	return filepath.Join(project_root, "/backend/tmp/uzume_test_work/", path)
}
