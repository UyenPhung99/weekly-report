"use client";

import * as React from "react";
import { Building2, Pencil, Plus, Trash2, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderPanel } from "@/components/layout/placeholder-panel";
import { DepartmentFormDialog } from "@/components/settings/department-form-dialog";
import { PersonFormDialog } from "@/components/settings/person-form-dialog";
import { PersonCell } from "@/components/shared/person-cell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useWeeklyReport, type MutationResult } from "@/lib/store";

export function SettingsView() {
  const {
    departments,
    people,
    meetings,
    tasks,
    deleteDepartment,
    deletePerson,
    getDepartmentName,
  } = useWeeklyReport();
  const { toast } = useToast();

  const handleDelete = async (
    resultPromise: Promise<MutationResult>,
    successTitle: string,
    successDescription: string,
  ) => {
    const result = await resultPromise;
    if (result.ok) {
      toast({
        title: successTitle,
        description: successDescription,
        variant: "info",
      });
    } else {
      toast({
        title: "Không thể xoá",
        description: result.reason,
        variant: "danger",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Cài đặt"
        description="Quản lý danh sách bộ phận và nhân sự dùng chung cho toàn bộ ứng dụng."
      />

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">
            Bộ phận ({departments.length})
          </TabsTrigger>
          <TabsTrigger value="people">Nhân sự ({people.length})</TabsTrigger>
        </TabsList>

        {/* --------------------------- Bộ phận --------------------------- */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <div className="space-y-1">
                <CardTitle>Danh sách bộ phận</CardTitle>
                <CardDescription>
                  Bộ phận được dùng để phân nhóm cuộc họp, công việc và nhân sự.
                </CardDescription>
              </div>
              <DepartmentFormDialog
                trigger={
                  <Button size="sm">
                    <Plus />
                    Thêm bộ phận
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <PlaceholderPanel
                  className="border-0 bg-transparent shadow-none"
                  icon={<Building2 className="h-6 w-6" />}
                  title="Chưa có bộ phận nào"
                  description="Thêm bộ phận đầu tiên để bắt đầu phân nhóm nhân sự và công việc."
                  action={
                    <DepartmentFormDialog
                      trigger={
                        <Button variant="soft">
                          <Plus />
                          Thêm bộ phận
                        </Button>
                      }
                    />
                  }
                />
              ) : (
                <div className="space-y-3">
                  {/* Bảng — từ màn hình lớn */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="min-w-[220px]">
                            Bộ phận
                          </TableHead>
                          <TableHead className="text-center">Nhân sự</TableHead>
                          <TableHead className="text-center">
                            Cuộc họp
                          </TableHead>
                          <TableHead className="text-center">
                            Công việc
                          </TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.map((department) => {
                          const peopleCount = people.filter(
                            (person) => person.departmentId === department.id,
                          ).length;
                          const meetingCount = meetings.filter(
                            (meeting) =>
                              meeting.departmentId === department.id,
                          ).length;
                          const taskCount = tasks.filter(
                            (task) => task.departmentId === department.id,
                          ).length;

                          return (
                            <TableRow key={department.id}>
                              <TableCell className="font-medium">
                                {department.name}
                              </TableCell>
                              <TableCell className="text-center">
                                {peopleCount}
                              </TableCell>
                              <TableCell className="text-center">
                                {meetingCount}
                              </TableCell>
                              <TableCell className="text-center">
                                {taskCount}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <DepartmentFormDialog
                                    department={department}
                                    trigger={
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        aria-label={`Sửa bộ phận: ${department.name}`}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    }
                                  />
                                  <ConfirmDeleteDialog
                                    label={`Xoá bộ phận: ${department.name}`}
                                    title="Xoá bộ phận?"
                                    description={`Bộ phận “${department.name}” sẽ bị xoá khỏi hệ thống.`}
                                    confirmLabel="Xoá bộ phận"
                                    onConfirm={() =>
                                      handleDelete(
                                        deleteDepartment(department.id),
                                        "Đã xoá bộ phận",
                                        department.name,
                                      )
                                    }
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Thẻ — tablet & mobile */}
                  <div className="space-y-3 lg:hidden">
                    {departments.map((department) => {
                      const peopleCount = people.filter(
                        (person) => person.departmentId === department.id,
                      ).length;
                      const taskCount = tasks.filter(
                        (task) => task.departmentId === department.id,
                      ).length;
                      const meetingCount = meetings.filter(
                        (meeting) => meeting.departmentId === department.id,
                      ).length;

                      return (
                        <div
                          key={department.id}
                          className="space-y-3 rounded-2xl bg-background/70 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium">{department.name}</p>
                            <div className="flex items-center gap-1">
                              <DepartmentFormDialog
                                department={department}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    aria-label={`Sửa bộ phận: ${department.name}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <ConfirmDeleteDialog
                                label={`Xoá bộ phận: ${department.name}`}
                                title="Xoá bộ phận?"
                                description={`Bộ phận “${department.name}” sẽ bị xoá khỏi hệ thống.`}
                                confirmLabel="Xoá bộ phận"
                                onConfirm={() =>
                                  handleDelete(
                                    deleteDepartment(department.id),
                                    "Đã xoá bộ phận",
                                    department.name,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                              {peopleCount} nhân sự
                            </Badge>
                            <Badge variant="info">
                              {meetingCount} cuộc họp
                            </Badge>
                            <Badge variant="outline">
                              {taskCount} công việc
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --------------------------- Nhân sự --------------------------- */}
        <TabsContent value="people">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <div className="space-y-1">
                <CardTitle>Danh sách nhân sự</CardTitle>
                <CardDescription>
                  Nhân sự có thể được giao việc và chủ trì cuộc họp.
                </CardDescription>
              </div>
              <PersonFormDialog
                trigger={
                  <Button size="sm" disabled={departments.length === 0}>
                    <Plus />
                    Thêm nhân sự
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <PlaceholderPanel
                  className="border-0 bg-transparent shadow-none"
                  icon={<Building2 className="h-6 w-6" />}
                  title="Cần có bộ phận trước"
                  description="Hãy thêm ít nhất một bộ phận, sau đó mới thêm được nhân sự."
                />
              ) : people.length === 0 ? (
                <PlaceholderPanel
                  className="border-0 bg-transparent shadow-none"
                  icon={<Users className="h-6 w-6" />}
                  title="Chưa có nhân sự nào"
                  description="Thêm nhân sự để bắt đầu giao việc và ghi nhận người chủ trì cuộc họp."
                  action={
                    <PersonFormDialog
                      trigger={
                        <Button variant="soft">
                          <Plus />
                          Thêm nhân sự
                        </Button>
                      }
                    />
                  }
                />
              ) : (
                <div className="space-y-3">
                  {/* Bảng — từ màn hình lớn */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="min-w-[220px]">
                            Nhân sự
                          </TableHead>
                          <TableHead>Bộ phận</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead className="text-center">
                            Công việc
                          </TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {people.map((person) => {
                          const taskCount = tasks.filter(
                            (task) => task.assigneeId === person.id,
                          ).length;

                          return (
                            <TableRow key={person.id}>
                              <TableCell>
                                <PersonCell personId={person.id} />
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {getDepartmentName(person.departmentId)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    person.role === "Trưởng bộ phận"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {person.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {taskCount}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <PersonFormDialog
                                    person={person}
                                    trigger={
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9"
                                        aria-label={`Sửa nhân sự: ${person.name}`}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    }
                                  />
                                  <ConfirmDeleteDialog
                                    label={`Xoá nhân sự: ${person.name}`}
                                    title="Xoá nhân sự?"
                                    description={`“${person.name}” sẽ bị xoá khỏi danh sách nhân sự.`}
                                    confirmLabel="Xoá nhân sự"
                                    onConfirm={() =>
                                      handleDelete(
                                        deletePerson(person.id),
                                        "Đã xoá nhân sự",
                                        person.name,
                                      )
                                    }
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Thẻ — tablet & mobile */}
                  <div className="space-y-3 lg:hidden">
                    {people.map((person) => {
                      const taskCount = tasks.filter(
                        (task) => task.assigneeId === person.id,
                      ).length;

                      return (
                        <div
                          key={person.id}
                          className="space-y-3 rounded-2xl bg-background/70 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <PersonCell personId={person.id} showDepartment />
                            <div className="flex items-center gap-1">
                              <PersonFormDialog
                                person={person}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    aria-label={`Sửa nhân sự: ${person.name}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <ConfirmDeleteDialog
                                label={`Xoá nhân sự: ${person.name}`}
                                title="Xoá nhân sự?"
                                description={`“${person.name}” sẽ bị xoá khỏi danh sách nhân sự.`}
                                confirmLabel="Xoá nhân sự"
                                onConfirm={() =>
                                  handleDelete(
                                    deletePerson(person.id),
                                    "Đã xoá nhân sự",
                                    person.name,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={
                                person.role === "Trưởng bộ phận"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {person.role}
                            </Badge>
                            <Badge variant="outline">
                              {taskCount} công việc
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function ConfirmDeleteDialog({
  label,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-coral-700 hover:bg-coral-100"
          aria-label={label}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Huỷ
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
