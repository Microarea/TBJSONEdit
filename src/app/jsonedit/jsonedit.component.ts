import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-jsonedit',
  templateUrl: './jsonedit.component.html',
  styleUrls: ['./jsonedit.component.css']
})
export class JsoneditComponent implements OnInit {
  public newTitleElem: any;
  pathJson = '';
  constructor() { }

  ngOnInit(): void {
    this.pathJson = 'test';

    this.newTitleElem = document.getElementById('main-content');
    this.newTitleElem.innerHTML = '<H3>PROVA AHAHAHAHAHA</H3>';
    //document.body.classList.add('test xxxxxxxxxxxxxxxxxx');
    //this.titleContainer.nativeElement.appendChild(this.newTitleElem);

  }

  public onOpenPath() {
    console.log(this.pathJson);
  }
}
