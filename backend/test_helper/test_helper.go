package test_helper

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/net/netutil"
)

func exists(name string) bool {
	_, err := os.Stat(name)
	return !os.IsNotExist(err)
}

func myRemoveAll(dir string) error {
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		return err
	}

	for _, file := range files {
		if file.IsDir() {
			if err := myRemoveAll(filepath.Join(dir, file.Name())); err != nil {
				return err
			}
		} else {
			// file
			if err := os.Remove(filepath.Join(dir, file.Name())); err != nil {
				return err
			}
		}
	}

	if err := os.Remove(dir); err != nil {
		return err
	}

	return nil
}

func InitializeTest() {
	test_work_dir := BuildFilePath("")

	files, err := ioutil.ReadDir(test_work_dir)
	if err != nil {
		fmt.Println(err)
	}

	for _, file := range files {
		if file.IsDir() {
			if err := myRemoveAll(filepath.Join(test_work_dir, file.Name())); err != nil {
				fmt.Println(err)
			}
		}
	}
	if !exists(test_work_dir) {
		if err := os.Mkdir(test_work_dir, 0777); err != nil {
			fmt.Println(err)
		}
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

func EqualBuffer(t *testing.T, expect, actual *bytes.Buffer) bool {
	var expect_bytes []byte
	var actual_bytes []byte
	expect.Write(expect_bytes)
	actual.Write(actual_bytes)
	return assert.Equal(t, expect_bytes, actual_bytes)
}

func NotEqualBuffer(t *testing.T, expect, actual *bytes.Buffer) bool {
	var expect_bytes []byte
	var actual_bytes []byte
	expect.Write(expect_bytes)
	actual.Write(actual_bytes)
	return assert.NotEqual(t, expect_bytes, actual_bytes)
}

func WriteMultipartImageField(t *testing.T, multipart_writer *multipart.Writer, field_name, file_path string) *bytes.Buffer {
	part, err := multipart_writer.CreateFormFile(field_name, filepath.Base(file_path))
	assert.NoError(t, err)

	// multipart bodyに画像データを流し込む
	image_file, err := os.Open(file_path)
	assert.NoError(t, err)
	defer image_file.Close()
	image_file_buffer := new(bytes.Buffer)
	_, err = io.Copy(image_file, image_file_buffer)
	assert.NoError(t, err)
	_, err = io.Copy(part, image_file)
	assert.NoError(t, err)
	return image_file_buffer
}

func Listener() net.Listener {
	ln, err := net.Listen("tcp", "")
	if err != nil {
		fmt.Println("listener error")
	}
	return netutil.LimitListener(ln, 1)
}
