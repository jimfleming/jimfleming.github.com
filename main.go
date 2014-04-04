package main

import (
	"os"
	"os/signal"

	"github.com/codegangsta/martini"
)

func main() {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt)

	m := martini.Classic()
	m.Use(martini.Static("."))
	go m.Run()

	<-sig
}
